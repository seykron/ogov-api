/** Represents a person that participates in a bill.
 * @param {Object} [rawPerson] Initial person information. Can be null.
 */
module.exports = function Person (rawPerson) {

  return Extend(this, {
    /** Person full name.
     * @type String
     */
    name: String,

    /** Party this person belongs to.
     * @type String
     */
    party: String,

    /** Province this person represents.
     * @type String
     */
    province: String
  }, rawPerson || {});
};
