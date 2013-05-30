/** Mongoose library to access MongoDB.
 *
 * @private
 * @fieldOf OG.core.SchemaRegistry#
 */
var mongoose = require("mongoose");

/** Represents a bill.
 *
 * @param {Object} [rawBill] Initial bill information. Can be null.
 * @constructor
 * @name ogov.model.Bill
 * @augments mongoose.Model
 */
module.exports = function Bill (rawBill) {

  return Extend(this, {
    /** Bill type. */
    type: String,

    /** Chamber that issued the bill.
     */
    source: String,

    /** Unique name of the file which contains this bill.
     */
    file: String,

    /** Description of publication file.
     */
    publishedOn: String,

    /** Time when the bill has been issued.
     */
    creationTime: Date,

    /** Bill summary information.
     */
    summary: String,

    /** List of subscribers. */
    subscribers: [{ _id: mongoose.Schema.ObjectId }]
  }, rawBill || {});
};

/** Entity schema additional information.
 */
module.exports.SCHEMA_INFO = {
  indexes: {
    file: 1
  }
};
