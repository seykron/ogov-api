/** Imports bills from the HCDN database.
 * As HCDN database isn't exposed via API, it scraps search results.
 *
 * @param {Object} [options] Importer configuration. Cannot be null.
 * @param {Number} [options.pageSize] Number of bills to retrieve per hit.
 *   Default is 1000.
 * @param {Number} [options.poolSize] Number of concurrent tasks fetching
 *   results at the same time. Default is 2.
 * @param {winston.Logger} [options.logger] Logger for this class. Can be null.
 * @constructor
 */
module.exports = function BillImporter(options) {

  /** Class logger, using the default if no one is provided.
   * @type winston.Logger
   * @constant
   * @private
   */
  var LOG = options && options.logger || require("winston");

  /** Number of concurrently tasks scrapping pages at the same time.
   * @type Number
   * @constant
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var POOL_SIZE = options && options.poolSize || 2;

  /** Number of queued pages waiting for scrapping.
   * @type Number
   * @constant
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var FRAME_SIZE = 15;

  /** Libraries required to parse results.
   * @constant
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var INCLUDES = ["./jquery.js"];

  /** Softpage document format supported by this reader.
   * @constant
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var DATA_SOURCE = "http://www1.hcdn.gov.ar/proyectos_search/resultado.asp?" +
    "ordenar=3" +
    "&chkDictamenes=on" +         // Get dictums.
    "&chkFirmantes=on" +          // Get subscribers.
    "&chkTramite=on" +            // Get parliamentary procedures.
    "&chkComisiones=on" +         // Get committees.
    "&fecha_inicio=01/01/1999" +  // Bills start date.
    "&fecha_fin=${endDate}" +     // Bills end date.
    "&whichpage=${pageNumber}" +  // Page number to fetch.
    "&pagesize=${pageSize}" +     // Number of bills per page.
    "&giro_giradoA=" +             // Required to make it work.
    "&odanno=" +                  // Required to make it work.
    "&pageorig=1" +               // Required to make it work.
    "&fromForm=1";                // Required to make it work.

  /** Node's FileSystem API.
   * @type {Object}
   * @private
   * @fieldOf BillImporterJob#
   */
  var fs = require("fs");

  /** Node's Path API.
   * @type {Object}
   * @private
   * @fieldOf BillImporterJob#
   */
  var path = require("path");

  /** Async flow contro library.
   * @type Object
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var async = require("async");

  /** JSDom library to parse results.
   * @type Object
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var jsdom = require("jsdom");

  /** Person domain entity.
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var Person = Import("ogov.domain.Person");

  /** Bill domain entity.
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var Bill = Import("ogov.domain.Bill");

  /** Procedure domain entity.
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var Procedure = Import("ogov.domain.Procedure");

  /** Dictum domain entity.
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var Dictum = Import("ogov.domain.Dictum");

  /** Last queued page.
   * @type Number
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var pageCount = 0;

  /** Flag that indicates whether to stop the importer.
   * @type Boolean
   * @private
   * @fieldOf OG.importer.BillImporter#
   */
  var stop = false;

  /** Removes spaces at the beginning and at the end of the specified String.
   * @param {String} string String to trim. Cannot be null.
   * @return {String} The trimmed String. Never returns null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var trim = function (string) {
    return string.replace(/^\s/, "").replace(/\s+$/, "");
  };

  /** Converts a date string from format dd/MM/YYYY to Date.
   * @param {String} dateString Date in the expected format. Cannot be null or
   *   empty.
   * @return {Date} Returns the date object that represents the provided date.
   *   Never returns null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var convertDate = function (dateString) {
    var period = dateString.split("/");
    return new Date(period[1] + "/" + period[0] + "/" + period[2]);
  };

  /** Returns the element text or throws an error if it doesn't exist.
   * @param {Element} element Element to get text from. Cannot be null.
   * @param {String} [errorMessage] Error message thrown if the element text
   *   is null or empty. Can be null.
   * @return {String} Returns the required text.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var errorIfEmpty = function (element, errorMessage) {
    if (!element || !element.textContent) {
      throw new Error(errorMessage || "Empty element found");
    }
    return trim(element.textContent);
  };

  /** Returns the element text or a default String if it doesn't exist.
   * @param {Element} element Element to get text from. Cannot be null.
   * @param {String} [defaultText] Default String used if the element doesn't
   *   contain text. Can be null.
   * @return {String} Returns the required text, or empty if it cannot be
   *   resolved.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var defaultIfEmpty = function (element, defaultText) {
    var content = defaultText || "";
    if (element && element.textContent) {
      content = element.textContent;
    }
    return trim(content);
  };

  /** Retrieves and parses the specified page.
   * @param {Number} pageNumber Page to fetch. Cannot be null.
   * @param {Function} callback Callback that receives results. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var fetchPage = function (pageNumber, callback) {
    var now = new Date();
    var url = DATA_SOURCE
      .replace("${endDate}", now.getDate() + "/" + now.getMonth() + "/" +
        now.getFullYear())
      .replace("${pageNumber}", pageNumber)
      .replace("${pageSize}", options && options.pageSize || 1000);

    LOG.info("Fetching page " + pageNumber);

    jsdom.env(url, INCLUDES, function (errors, window) {
      var bills = [];
      var failedBills = [];
      var jQuery = window.jQuery;
      var documents = jQuery(".toc");

      if (errors) {
        LOG.info("Error fetching page " + pageNumber + ": " + err);

        return callback(new Error(errors));
      }

      if (documents.length === 0) {
        LOG.info("Error fetching page " + pageNumber);

        return callback(new Error("Empty response, maybe querying error?"));
      }

      async.forEachLimit(documents, 10, function (document, next) {
        var rawBill = {};

        async.waterfall([
          async.apply(extractBill, jQuery, jQuery(document), rawBill),
          async.apply(extractSubscribers, jQuery, jQuery(document), rawBill),
          async.apply(extractCommittees, jQuery, jQuery(document), rawBill),
          async.apply(extractDictums, jQuery, jQuery(document), rawBill),
          async.apply(extractProcedures, jQuery, jQuery(document), rawBill)
        ], function (err) {
          if (err) {
            failedBills.push({
              bill: rawBill,
              error: err
            });
          } else {
            Bill.update({ file: rawBill.file }, rawBill, {
              upsert: true
            }, function (err, numberAffected, bill) {
              if (err) {
                failedBills.push({
                  bill: rawBill,
                  error: err
                });
              } else {
                bills.push(bill);
              }
              next();
            });
          }
        });
      }, function (err) {
        if (err) {
          LOG.info("Error parsing page " + pageNumber + ": " + err);
        } else {
          LOG.info("Page " + pageNumber + " parsing completed: " +
            bills.length + " bills succeed, " + failedBills.length +
            " in error.");
        }
        callback(err, bills, failedBills);
      });
    });
  };

  /** Extracts the list of subscribers within the bill.
   *
   * @param {Object} jQuery jQuery framework. Cannot be null.
   * @param {Element} document Source document element. Cannot be null.
   * @param {Object} rawBill Bill being populated. Cannot be null.
   * @param {Function} callback Callback invoked when subscribers scrapping
   *    finished. It receives an error as parameter. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var extractSubscribers = function (jQuery, document, rawBill, callback) {
    var subscribersEl = document.find("div.item1:eq(0) > table > tr");
    var subscribers = [];

    async.forEachLimit(subscribersEl, 10, function (subscriberEl, next) {
      var subscriberData = jQuery(subscriberEl).children();
      var rawSubscriber;
      var name = errorIfEmpty(subscriberData.get(0));

      // Not a subscriber, just the section title.
      if (subscriberData.find("span").length === 1) {
        return next();
      }
      rawSubscriber = {
        party: defaultIfEmpty(subscriberData.get(1), "NONE"),
        province: errorIfEmpty(subscriberData.get(2))
      };

      Person.findOneAndUpdate({ name: name }, rawSubscriber, {
        upsert: true
      }, function (err, subscriber) {
        subscribers.push(subscriber);
        next(err);
      });
    }, function (err) {
      if (err) {
        LOG.info("Error extracting subscribers: " + err);
      }

      rawBill.subscribers = subscribers;

      callback(err);
    });
  };

  /** Extracts the list of committees that reviewed the bill.
   *
   * @param {Object} jQuery jQuery framework. Cannot be null.
   * @param {Element} document Source document element. Cannot be null.
   * @param {Function} callback Callback invoked when subscribers scrapping
   *    finished. It receives an error as parameter. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var extractCommittees = function (jQuery, document, rawBill, callback) {
    var committeesEl = document.find("div.item1:eq(1) > table > tr");
    var committeeData;
    var i;

    try {
      rawBill.committees = [];

      for (i = 0; i < committeesEl.length; i++) {
        committeeData = jQuery(committeesEl.get(i)).find("td");

        // Ignores the section title.
        if (committeeData.find("span").length === 0) {
          rawBill.committees.push(errorIfEmpty(committeeData.get(0)));
        }
      }
      callback(null);
    } catch (err) {
      callback(err);
    }
  };

  /** Extracts the list of dictums over the bill.
   *
   * @param {Object} jQuery jQuery framework. Cannot be null.
   * @param {Element} document Source document element. Cannot be null.
   * @param {Object} rawBill Bill being populated. Cannot be null.
   * @param {Function} callback Callback invoked when subscribers scrapping
   *    finished. It receives an error as parameter. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var extractDictums = function (jQuery, document, rawBill, callback) {
    var dictumsEl = document.find("div.item1:eq(2) > table > tr");
    var dictums = [];

    async.forEachLimit(dictumsEl, 10, function (dictumEl, next) {
      try {
        var dictumData = jQuery(dictumEl).children();
        var rawDictum;
        var name = errorIfEmpty(dictumData.get(0));

        // Not a dictum, just the section title.
        if (dictumData.find("span").length === 1) {
          return next();
        }

        rawDictum = {
          file: rawBill.file,
          source: errorIfEmpty(dictumData.get(0)),
          orderPaper: errorIfEmpty(dictumData.get(1)),
          date: convertDate(defaultIfEmpty(dictumData.get(2))),
          result: defaultIfEmpty(dictumData.get(3))
        };

        Dictum.findOneAndUpdate({ file: rawBill.file }, rawDictum, {
          upsert: true
        }, function (err, dictum) {
          dictums.push(dictum);
          next(err);
        });
      } catch (err) {
        next(err);
      }
    }, function (err) {
      if (err) {
        LOG.info("Error extracting dictums: " + err);
      }

      rawBill.dictums = dictums;

      callback(err);
    });
  };

  /** Extracts the list of procedures for the bill.
   *
   * @param {Object} jQuery jQuery framework. Cannot be null.
   * @param {Element} document Source document element. Cannot be null.
   * @param {Object} rawBill Bill being populated. Cannot be null.
   * @param {Function} callback Callback invoked when subscribers scrapping
   *    finished. It receives an error as parameter. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var extractProcedures = function (jQuery, document, rawBill, callback) {
    var proceduresEl = document.find("div.item1:eq(3) > table > tr");
    var procedures = [];

    async.forEachLimit(proceduresEl, 10, function (procedureEl, next) {
      try {
        var procedureData = jQuery(procedureEl).children();
        var rawProcedure;
        var name = errorIfEmpty(procedureData.get(0));

        // Not a procedure, just the section title.
        if (procedureData.find("span").length === 1) {
          return next();
        }

        rawProcedure = {
          file: rawBill.file,
          source: errorIfEmpty(procedureData.get(0)),
          topic: defaultIfEmpty(procedureData.get(1)),
          date: convertDate(defaultIfEmpty(procedureData.get(2))),
          result: defaultIfEmpty(procedureData.get(3))
        };

        Procedure.findOneAndUpdate({ file: rawBill.file }, rawProcedure, {
          upsert: true
        }, function (err, procedure) {
          procedures.push(procedure);
          next(err);
        });
      } catch (err) {
        next(err);
      }
    }, function (err) {
      if (err) {
        LOG.info("Error extracting procedures: " + err);
      }

      rawBill.procedures = procedures;

      callback(err);
    });
  };

  /** Extracts bill general information and stores it into the bill.
   *
   * @param {Element} document Source document element. Cannot be null.
   * @param {Object} bill The bill being created. Cannot be null.
   * @private
   * @methodOf OG.importer.BillImporter#
   */
  var extractBill = function (jQuery, document, rawBill, callback) {
    var generalInformation = document.find("span.item1 > div").contents();
    var file = errorIfEmpty(generalInformation.get(3));

    try {
      Extend(rawBill, {
        type: document.find(".item1 > b").text(),
        source: errorIfEmpty(generalInformation.get(1)),
        file: file,
        publishedOn: errorIfEmpty(generalInformation.get(6)),
        creationTime: convertDate(errorIfEmpty(generalInformation.get(8)))
      });

      if (generalInformation.length > 10) {
        // Standard format, no additional information.
        Extend(rawBill, {
          summary: defaultIfEmpty(generalInformation.get(11))
        });
      } else {
        // Must get additional information.
        generalInformation = document.find("span.item1 > div > div").contents();

        Extend(rawBill, {
          revisionChamber: defaultIfEmpty(generalInformation.get(1)),
          revisionFile: defaultIfEmpty(generalInformation.get(3)),
          summary: defaultIfEmpty(generalInformation.get(6)) ||
            defaultIfEmpty(generalInformation.get(7))
        });
      }
      callback(null);
    } catch (err) {
      callback(err);
    }
  };

  return {
    /** Starts the importer and notifies every time a page is ready.
     *
     * @para {Number} lastPage Last page fetched to resume an import process
     *    point. Cannot be null.
     * @param {Function} pageSuccessCallback Function invoked when a single page
     *   is already processed. It takes the <code>pageNumber</code>, the list of
     *   <code>bills</code>, <code>failedBills</code> and a callback to continue
     *   processing the next page in the queue.
     */
    start: function (lastPage, pageSuccessCallback) {
      pageCount = lastPage;

      var queue = async.queue(function (pageNumber, callback) {
        if (stop) {
          LOG.info("Page " + pageNumber + " import aborted.");
          return callback();
        }

        async.waterfall([
          async.apply(fetchPage, pageNumber),
          async.apply(pageSuccessCallback, pageNumber)
        ], function (err) {
          if (err) {
            LOG.info("Import halted by the client: " + err);
          }
          stop = err ? true : false;
          callback();
        });
      }, POOL_SIZE);

      queue.empty = function () {
        var i;
        LOG.info("Queue empty. Adding another " + FRAME_SIZE +
          " pages to the queue.");
        if (stop) {
          return;
        }
        for (i = 0; i < FRAME_SIZE; i++) {
          queue.push(++pageCount);
        }
      };
      queue.empty();
    }
  };
};
