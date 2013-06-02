/** Global import. */
Import = require("./util/Import");
Import.baseDir(__dirname);

/** Global extend. */
Extend = Import("ogov.util.Extend");

var SchemaRegistry = Import("ogov.core.SchemaRegistry");
var DataSource = Import("ogov.core.DataSource");

/** Mapping of persistent classes used by ogov-api.
 * @type {Object}
 */
var PERSISTENT_CLASSES = {
  "OG.domain.Bill": Import("ogov.domain.Bill"),
  "OG.domain.Person": Import("ogov.domain.Person"),
  "OG.domain.Procedure": Import("ogov.domain.Procedure"),
  "OG.domain.Dictum": Import("ogov.domain.Dictum")
};

module.exports = {

  /** Starts ogov API.
   * @param {Function} callback Function invoked when initialization is
   *    completed. It takes a callback as parameter in order to register
   *    endpoints into an express application. Cannot be null.
   */
  start: function (callback) {
    DataSource.connect(function () {
      var modelName;
      var persistentClass;

      for (modelName in PERSISTENT_CLASSES) {
        persistentClass = PERSISTENT_CLASSES[modelName];
        SchemaRegistry.register(modelName, persistentClass,
          persistentClass.SCHEMA_INFO);
      }
      callback(Import("ogov.application.Endpoints"));
    });
  }
};
