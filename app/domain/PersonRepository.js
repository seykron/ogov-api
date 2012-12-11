
/** Repository to manage people.
 * @constructor
 * @name ogov.domain.PersonRepository
 */
module.exports = function PersonRepository() {

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

  /** Query builder class to create mongo queries.
   * @type Function
   * @private
   * @fieldOf ogov.domain.BillRepository#
   */
  var QueryBuilder = Import("ogov.domain.QueryBuilder");

  /** Adds common query operators.
   *
   * @param {Object} [criteria] Search criteria. Can be null.
   * @param {String} [criteria.party] Required person party.
   * @param {String} [criteria.province] Required person province.
   * @param {String} [criteria.name] Required person name.
   * @return {QueryBuilder} Returns the query builder to keep adding operations.
   */
  var createQueryBuilder = function (criteria) {
    var queryBuilder = new QueryBuilder();

    if (criteria.party) {
      queryBuilder.eq({ party: criteria.party });
    }
    if (criteria.province) {
      queryBuilder.eq({ province: criteria.province });
    }
    if (criteria.name) {
      queryBuilder.regex({ name: new RegExp(criteria.name) });
    }

    return queryBuilder;
  };

  return {

    /** Search for people that belong to the specified parties.
     *
     * @param {Object} [criteria] Search criteria. Can be null.
     * @param {String} [criteria.party] Required person party.
     * @param {String} [criteria.province] Required person province.
     * @param {String} [criteria.name] Required person name.
     * @param {Function} [callback] Callback that receives the stram to read
     *   query results. Can be null.
     */
    list: function (criteria, callback) {
      var query = createQueryBuilder(criteria).build();
      callback(Person.find(query).stream());
    },

    /** Search for people that belong to the specified parties.
     *
     * @param {String[]} parties List of party names. Cannot be null.
     * @param {Object} [criteria] Search criteria. Can be null.
     * @param {String} [criteria.party] Required person party.
     * @param {String} [criteria.province] Required person province.
     * @param {String} [criteria.name] Required person name.
     * @param {Function} [callback] Callback that receives the stram to read
     *   query results. Can be null.
     */
    findByParties: function (parties, criteria, callback) {
      var query = createQueryBuilder(criteria).contains({
        party: parties
      }).build();

      callback(Person.find(query).stream());
    },

    /** Returns the number of presented bills by person.
     *
     * @param {Object} [criteria] Search criteria. Can be null.
     * @param {String} [criteria.party] Required person party.
     * @param {String} [criteria.province] Required person province.
     * @param {String} [criteria.name] Required person name.
     * @param {Function} [callback] Callback that receives the stram to read
     *   query results. Can be null.
     */
    numberOfPresentedBills: function (criteria, callback) {
      var query = createQueryBuilder(criteria).build();
      var queryBuilder = new QueryBuilder();

      Person.find(query, function (err, people) {
        Bill.mapReduce({
          query: queryBuilder.contains({
            subscribers: people.map(function (person) {
              return {
                _id: person._id
              };
            })
          }).build(),
          map: function () {
            this.subscribers.forEach(function (subscriber) {
              emit(subscriber._id, 1);
            });
          },
          reduce: function (key, values) {
            return Array.sum(values);
          }
        }, function (err, results) {
          callback(results);
        })
      });
    }
  };
};
