
module.exports = function Person (rawPerson) {

  /** Application data source.
   * @type ogov.core.DataSource
   * @private
   * @fieldOf ogov.domain.Person#
   */
  var DataSource = Import("ogov.core.DataSource");

  /** Bill model definition.
   * @type Function
   * @private
   * @fieldOf OG.model.Bill
   */
  var Model = DataSource.Model("OG.domain.Person");

  return new Model(rawPerson);
};
