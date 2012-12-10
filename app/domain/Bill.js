/** Represents a bill.
 *
 * @constructor
 */
module.exports = function Bill (rawBill) {

  var DataSource = Import("ogov.core.DataSource");

  /** Bill model definition.
   * @type Function
   * @private
   * @fieldOf OG.model.Bill
   */
  var Model = DataSource.Model("OG.domain.Bill");

  /** Base object to inherit behaviour from.
   * @private
   */
  var base = new Model(rawBill);

  return Extend(base, {
    findByParty: function (partyName) {

    }
  });
};
