
/** Repository to manage bills.
 * @constructor
 */
module.exports = function BillRepository() {

  /** Application data source.
   * @type ogov.core.DataSource
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var DataSource = Import("ogov.core.DataSource");

  /** Bill domain entity.
   * @type ogov.domain.Bill
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var Bill = Import("ogov.domain.Bill");

  /** Person domain entity.
   * @type ogov.domain.Person
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var Person = Import("ogov.domain.Person");

  /** Normalizes the specified search criteria.
   *
   * @param {Object} [criteria] Search criteria. Can be null.
   * @param {String | Number} [criteria.fromDate] Either timestamp or date
   *   String to filter bills from. Default is the current date, so bills are
   *   listed backward.
   * @param {String | Number} [criteria.toDate] Either timestamp or date
   *   String to filter bills to. Default is null, so there's no limit
   *   listing bills backward.
   * @param {Boolean} [criteria.backward] Indicates whether to list backward
   *   on time or not. If it's true, bills are listed since fromDate backward
   *   on time until toDate. If it's false bills are listed since fromDate
   *   forward on time until toDate. Default is true.
   * @return {Query} Returns a node Stream to read results from. Never
   *   returns null.
   */
  var createCriteria = function (criteria) {
    var from = new Date(criteria.fromDate || new Date().getTime());
    var to = new Date(criteria.toDate || new Date().getTime());
    var query = (function () {
      var result = {
        creationTime: { $lte: criteria.backward ? from : to }
      };

      if (criteria.toDate !== undefined) {
        result.creationTime.$gte = criteria.backward ? to : from;
      }

      return result;
    }());

    return query;
  };

  return {

    /** Lists bills filtering by a range of dates.
     *
     * @param {Object} [criteria] Search criteria. Can be null.
     * @param {String | Number} [criteria.fromDate] Either timestamp or date
     *   String to filter bills from. Default is the current date, so bills are
     *   listed backward.
     * @param {String | Number} [criteria.toDate] Either timestamp or date
     *   String to filter bills to. Default is null, so there's no limit
     *   listing bills backward.
     * @param {Boolean} [criteria.backward] Indicates whether to list backward
     *   on time or not. If it's true, bills are listed since fromDate backward
     *   on time until toDate. If it's false bills are listed since fromDate
     *   forward on time until toDate. Default is true.
     * @param {Function} [callback] Callback that receives the stram to read
     *   query results. Can be null.
     */
    list: function (criteria) {
      callback(Bill.find(createCriteria(criteria)).stream());
    },

    /** Search for bills which subscribers belong to one of the specified
     * parties.
     *
     * @param {String[]} parties List of party names. Cannot be null.
     * @param {Object} [criteria] Search criteria. Can be null.
     * @param {String | Number} [criteria.fromDate] Either timestamp or date
     *   String to filter bills from. Default is the current date, so bills are
     *   listed backward.
     * @param {String | Number} [criteria.toDate] Either timestamp or date
     *   String to filter bills to. Default is null, so there's no limit
     *   listing bills backward.
     * @param {Boolean} [criteria.backward] Indicates whether to list backward
     *   on time or not. If it's true, bills are listed since fromDate backward
     *   on time until toDate. If it's false bills are listed since fromDate
     *   forward on time until toDate. Default is true.
     * @param {Function} [callback] Callback that receives the stram to read
     *   query results. Can be null.
     */
    findByParties: function (parties, criteria, callback) {
      Person.find({ party: { $in: parties }}, function (err, people) {
        var query = createCriteria(criteria);
        query.subscribers = {
          $in: people.map(function (person) {
            return {
              _id: person._id
            };
          })
        };
        if (callback) {
          callback(Bill.find(query).stream());
        }
      });
    }
  };
};
