/** Represents a parlamientary procedure.
 * @param {Object} [rawProcedure] Initial procedure information. Can be null.
 */
module.exports = function Procedure (rawProcedure) {

  return Extend(this, {
    /** Bill identifier file.
     * @type String
     */
    file: String,

    /** Chamber that issued this procedure.
     * @type String
     */
    source: String,

    /** Procedure objective.
     * @type String
     */
    topic: String,

    /** Date this procedure has been issued.
     * @type Date
     */
    date: Date,

    /** Procedure result description, if any.
     * @type String
     */
    result: String
  }, rawProcedure || {});
};

/** Entity schema additional information.
 */
module.exports.SCHEMA_INFO = {
  indexes: {
    file: 1
  }
};
