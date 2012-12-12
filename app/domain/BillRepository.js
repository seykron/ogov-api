
/** Repository to manage bills.
 * @constructor
 * @name ogov.domain.BillRepository
 */
module.exports = function BillRepository() {

  /** Time from which bills are registered.
   * @constant
   * @private
   */
  var BILL_START_DATE = new Date("01/01/1991");

  /** Application data source.
   * @type ogov.core.DataSource
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var DataSource = Import("ogov.core.DataSource");

  /** Bill domain entity.
   * @type Function
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var Bill = Import("ogov.domain.Bill");

  /** Person domain entity.
   * @type Function
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var Person = Import("ogov.domain.Person");

  /** Query builder class to create mongo queries.
   * @type Function
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var QueryBuilder = Import("ogov.domain.QueryBuilder");

  /** Wrapper used to return query streams.
   * @type {ogov.core.QueryStreamWrapper}
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var QueryStreamWrapper = Import("ogov.core.QueryStreamWrapper");

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
   * @return {QueryBuilder} Returns the query builder to keep adding operations.
   * @methodOf ogov.domain.BillRepository#
   */
  var createQueryBuilder = function (criteria) {
    var from = criteria.backward ? new Date() : undefined;
    var to = criteria.backward ? undefined : BILL_START_DATE;
    var queryBuilder = new QueryBuilder();

    if (criteria.fromDate) {
      from = criteria.backward ? new Date(criteria.fromDate) :
        new Date(criteria.toDate || BILL_START_DATE);
    }
    if (criteria.toDate) {
      to = criteria.backward ? new Date(criteria.toDate) :
        new Date(criteria.fromDate || new Date().getTime());
    }
    if (from && to) {
      queryBuilder
        .lte({ creationTime: criteria.backward ? from : to })
        .gte({ creationTime: criteria.backward ? to : from });
    }
    return queryBuilder;
  };

  /** Wraps the specified QueryStream.
   * @param {mongoose.QueryStream} queryStream QueryStream to wrap. Cannot be
   *   null.
   * @return {ogov.core.QueryStreamWrapper} Returns the wrapped stream. Never
   *   returns null.
   * @private
   * @methodOf ogov.domain.BillRepository#
   */
  var wrapQueryStream = function (queryStream) {
    return new QueryStreamWrapper(queryStream);
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
    list: function (criteria, callback) {
      callback(wrapQueryStream(Bill
        .find(createQueryBuilder(criteria).build()).stream()));
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
      var textParties = parties.map(function (party) {
        return party.toUpperCase();
      });

      Person.find({ party: { $in: textParties }}, function (err, people) {
        var queryBuilder = createQueryBuilder(criteria);
        queryBuilder.contains({
          subscribers: people.map(function (person) {
            return {
              _id: person._id
            };
          })
        });
        if (callback) {
          callback(wrapQueryStream(Bill.find(queryBuilder.build()).stream()));
        }
      });
    },

    /** Search for bills signed off by the specified person.
     *
     * @param {String} personId Id of the person that signed off required bills.
     *   cannot be null or empty.
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
    findByPerson: function (personId, criteria, callback) {
      var queryBuilder = createQueryBuilder(criteria);
      queryBuilder.contains({
        subscribers: [{
          _id: personId
        }]
      });
      callback(wrapQueryStream(Bill.find(queryBuilder.build()).stream()));
    }
  };
};
