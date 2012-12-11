/** Buils MongoDB queries applying common operators.
 *
 * Currently supports comparison, logical, element and JavaScript operators.
 *
 * @constructor
 * @name ogov.domain.QueryBuilder
 */
module.exports = function QueryBuilder() {
  /** Query object.
   * @type Object
   * @private
   * @fieldOf ogov.domain.QueryBuilder#
   */
  var query = {};

  /** Adds an operator for the specified field.
   *
   * @param {String} operator Operator to append. Cannot be null or empty.
   * @param {Object} args Operator arguments. Cannot be null.
   * @param {Function} [callback] Optional callback used to map the operator
   *   value instead of replacing the existing value. It takes the operator
   *   name, the old value and the new value as arguments. Must return the
   *   operator value.
   */
  var addOperator = function (operator, args, map) {
    var fieldName;
    var field;

    for (fieldName in args) {
      if (args.hasOwnProperty(fieldName)) {
        field = query[fieldName] || {};

        if (map) {
          field[operator] = map(field[operator], args[fieldName]);
        } else {
          field[operator] = args[fieldName];
        }
        query[fieldName] = field;
      }
    }
  };

  /** Adds a logical operator for the specified field.
   *
   * @param {String} operator Operator to append. Cannot be null or empty.
   * @param {Object} args Operator arguments. Cannot be null.
   */
  var addLogicalOperator = function (operator, args) {
    var value = query[operator] || [];
    value.push(args);
    query[operator] = value;
  };

  /** Maps collection operator value so it's possible to append elements to the
   * existing value if required.
   *
   * @param {Boolean} append Indicates whether to append values to the
   *   existing operator, or just replace it by the new collection. Default
   *   is to replace the existing value.
   * @param {Object[]} oldValue Existing operator value. Can be null.
   * @param {Object[]} newValue New operator value. Cannot be null.
   * @return {Object[]} Returns either the augmented collection or the new
   *   value.
   */
  var collectionOperatorMap = function (append, oldValue, newValue) {
    var value = oldValue || [];

    if (append === true) {
      return value.concat(newValue);
    } else {
      return newValue;
    }
  };

  return {

    /** Selects the documents where the value of the field is equal
     * (i.e. ==) to the specified value.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    eq: function (args) {
      var fieldName;
      for (fieldName in args) {
        if (args.hasOwnProperty(fieldName)) {
          query[fieldName] = args[fieldName];
        }
      }
      return this;
    },

    /** $ne selects the documents where the value of the field is not equal
     * (i.e. !=) to the specified value. This includes documents that do not
     * contain the field.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    ne: function (args) {
      addOperator("$ne", args);
      return this;
    },

    /** $lt selects the documents where the value of the field is less than
     * (i.e. <) the specified value.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    lt: function (args) {
      addOperator("$lt", args);
      return this;
    },

    /** $lte selects the documents where the value of the field is less than or
     * equal to (i.e. <=) the specified value.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    lte: function (args) {
      addOperator("$lte", args);
      return this;
    },

    /** $gt selects those documents where the value of the field is greater
     * than (i.e. >) the specified value.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    gt: function (args) {
      addOperator("$gt", args);
      return this;
    },

    /** $gte selects the documents where the value of the field is greater than
     * or equal to (i.e. >=) a specified value (e.g. value.).
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    gte: function (args) {
      addOperator("$gte", args);
      return this;
    },

    /** $in selects the documents where the field value equals any value in the
     * specified array (e.g. <value1>, <value2>, etc.).
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @param {Boolean} [append] Indicates whether to append values to the
     *   existing operator, or just replace it by the new collection. Default
     *   is to replace the existing value.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    contains: function (args, append) {
      addOperator("$in", args, collectionOperatorMap.bind(this, append));
      return this;
    },

    /** $nin selects the documents where:
     *
     * <ul>
     *   <li>the field value is not in the specified array or</li>
     *   <li>the field does not exist.</li>
     * </ul>
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    nin: function (field, value, defaultValue) {
      addOperator("$nin", args, collectionOperatorMap.bind(this, append));
      return this;
    },

    /** $all selects the documents where the field holds an array and contains
     * all elements (e.g. <value>, <value1>, etc.) in the array.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    all: function (args, append) {
      addOperator("$all", args, collectionOperatorMap.bind(this, append));
      return this;
    },

    /** $and performs a logical AND operation on an array of two or more
     * expressions (e.g. <expression1>, <expression2>, etc.) and selects the
     * documents that satisfy all the expressions in the array. The $and
     * operator uses short-circuit evaluation. If the first expression (e.g.
     * <expression1>) evaluates to false, MongoDB will not evaluate the
     * remaining expressions.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    and: function (args) {
      addLogicalOperator("$and", args);
      return this;
    },

    /** The $or operator performs a logical OR operation on an array of two or
     * more <expressions> and selects the documents that satisfy at least one
     * of the <expressions>.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    or: function (args) {
      addLogicalOperator("$or", args);
      return this;
    },

    /** $nor performs a logical NOR operation on an array of two or more
     * <expressions> and selects the documents that fail all the <expressions>
     * in the array.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    nor: function (args) {
      addLogicalOperator("$nor", args);
      return this;
    },

    /** $not performs a logical NOT operation on the specified
     * <operator-expression> and selects the documents that do not match the
     * <operator-expression>. This includes documents that do not contain the
     * field.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    not: function (args) {
      addOperator("$not", args);
      return this;
    },

    /** $exists selects the documents that contain the field if <bool> is
     * true. If <bool> is false, the query only returns the documents that
     * do not contain the field. Documents that contain the field but has the
     * value null are not returned.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    exists: function (bool) {
      addOperator("$exists", bool);
      return this;
    },

    /** $type selects the documents where the value of the field is the
     * specified BSON type.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    type: function (args) {
      addOperator("$type", args);
      return this;
    },

    /** $mod selects the documents where the field value divided by the divisor
     * has the specified remainder.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    mod: function (args) {
      addOperator("$mod", args);
      return this;
    },

    /** Use the $where operator to pass a string containing a JavaScript
     * expression to the query system to provide greater flexibility with
     * queries.
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    where: function (args) {
      query["$where"] = args;
      return this;
    },

    /** The $regex operator provides regular expression capabilities in queries.
     * MongoDB uses Perl compatible regular expressions (i.e. “PCRE.”).
     *
     * @param {Object} args Operator arguments. Cannot be null.
     * @return {ogov.domain.QueryBuilder} Returns this object to continue
     *   building the query.
     */
    regex: function (args) {
      addOperator("$regex", args);
      return this;
    },

    /** Takes current parameters and builds the query object.
     *
     * Operator values are copied by reference.
     *
     * @return {Object} Returns a plain object with query parameters. Never
     *   returns null.
     */
    build: function () {
      var fieldName;
      var newQuery = {};

      for (fieldName in query) {
        if (query.hasOwnProperty(fieldName)) {
          if (typeof newQuery[fieldName] === "object") {
            newQuery[fieldName] = Extend({}, query[fieldName]);
          } else {
            newQuery[fieldName] = query[fieldName];
          }
        }
      }
      return newQuery;
    }
  };
};
