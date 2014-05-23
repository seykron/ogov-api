/** Job to schedule the bills import.
 * @param {String} cronPattern Valid cron pattern to setup the scheduler.
 *   Cannot be null or empty.
 * @constructor
 */
module.exports = function BillImporterJob(cronPattern) {

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

  /** Logger for the importer.
   * @type winston.Logger
   * @private
   * @fieldOf OG.import.BillImporterJob#
   */
  var LOG = (function () {
    var winston = require("winston");
    var logger = winston.Logger({
      transports: [
        new winston.transports.File({ filename: 'importer.log' })
      ]
    });
    return winston;
  }());

  /** List of imported pages results.
   * @type Object[]
   * @private
   * @fieldOf OG.import.BillImporterJob#
   */
  var pageResult = [];

  /** Bill importer to run.
   * @type OG.import.BillImporter
   * @private
   * @fieldOf OG.import.BillImporterJob#
   */
  var importer = new Import("ogov.importer.BillImporter")({
    poolSize: 4,
    pageSize: 250,
    logger: LOG
  });

  /** Starts the importer.
   *
   * @private
   * @fieldOf OG.import.BillImporterJob#
   */
  var execute = function () {
    var lastPage = 0;
    var lastPageFile = path.join(__dirname, "..", "..", "last_page.log");

    if (fs.existsSync(lastPageFile)) {
      lastPage = fs.readFileSync(lastPageFile).toString();
      if (isNaN(lastPage)) {
        lastPage = 0;
      }
    }

    importer.start(lastPage, function (pageNumber, bills, failedBills, callback) {
      lastPage = pageNumber;

      pageResult.push({
        number: pageNumber,
        success: bills.length,
        failed: failedBills.length
      });

      if (fs.existsSync(lastPageFile)) {
        lastPage = fs.readFileSync(lastPageFile).toString();

        if (isNaN(lastPage)) {
          lastPage = 0;
        }
      }

      fs.writeFileSync(lastPageFile, lastPage);

      callback();
    });
  };

  return {

    /** Forces to run the import job.
     */
    run: function () {
      execute();
    },

    /** Set up the schedule to run the import job using the cron pattern
     * specified in the constructor.
     */
    schedule: function () {
      var CronJob = require("cron").CronJob;
      var job = new CronJob({
        cronTime: cronPattern,
        onTick: execute,
        start: true
      });
    }
  };
}
