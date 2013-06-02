/** Represents a dictum over a Bill.
 * @param {Object} [rawDictum] Initial dictum information. Can be null.
 */
module.exports = function Dictum (rawDictum) {

  return Extend(this, {

    /** Bill identifier file.
     * @type String
     */
    file: String,

    /** Chamber that issued this dictum.
     * @type String
     */
    source: String,

    /** Order paper that treated this dictum.
     * @type String
     */
    orderPaper: String,

    /** Date this dictum has been issued.
     * @type Date
     */
    date: Date,

    /** Dictum result description, if any.
     * @type String
     */
    result: String
  }, rawDictum || {});
};

/** Entity schema additional information.
 */
module.exports.SCHEMA_INFO = {
  indexes: {
    file: 1
  }
};
