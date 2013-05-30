/** Connection data source.
 * TODO(matias.mirabelli): support different environments.
 *
 * @constant
 * @private
 */
var DATA_SOURCE = "mongodb://localhost/test";

/** Mongoose library to access MongoDB.
 *
 * @private
 * @fieldOf OG.DataSource#
 */
var mongoose = require("mongoose");

/** MongoDB database connection; null until connect() is called.
 *
 * @type Object
 * @private
 * @fieldOf OG.DataSource#
 */
var db;

/** Utility object to simplify model objects definition.
 * It allows to define schemas and models.
 */
module.exports = {
  /** Creates the connection to MongoDB database.
   */
  connect: function (callback) {
    db = mongoose.createConnection(DATA_SOURCE);
    db.on('error', function (message) {
      throw new Error(message);
    });
    db.once('open', function () {
      console.log("Connected to " + DATA_SOURCE);
      if (callback) {
        callback();
      }
    });
  },

  /** Removes all elements in all registered collections.
   * @param {Function} callback Callback invoked when all elements were
   *   removed. Cannot be null.
   */
  clean: function (callback) {
    var modelName;
    var models = Import("ogov.core.SchemaRegistry").listModels();

    var cleanNextModel = function (model) {
      if (!model) {
        return callback();
      }
      model.remove({}, cleanNextModel.bind(this, models.shift()));
    };

    cleanNextModel(models.shift());
  },

  /** Creates a new model.
   * @return {mongoose.Model} Returns a new mongoose model. Never returns null.
   */
  createModel: function (model, schema) {
    return db.model(model, schema);
  }
};
