/** Job to schedule the bills import.
 * @param {String} cronPattern Valid cron pattern to setup the scheduler.
 *   Cannot be null or empty.
 * @constructor
 */
module.exports = function BillImporterJob(cronPattern) {

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
    importer.start(function (pageNumber, bills, failedBills, callback) {
      pageResult.push({
        number: pageNumber,
        success: bills.length,
        failed: failedBills.length
      });

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
