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

/** Existing model definitions.
 * @type Object[String => Object]
 * @private
 * @fieldOf OG.DataSource#
 */
var modelDefinitions = {};

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
    var models = [];

    var cleanNextModel = function (model) {
      if (!model) {
        return callback();
      }
      model.remove({}, cleanNextModel.bind(this, models.shift()));
    };

    for (modelName in modelDefinitions) {
      if (modelDefinitions.hasOwnProperty(modelName)) {
        models.push(modelDefinitions[modelName].model);
      }
    }

    cleanNextModel(models.shift());
  },

  /** Utility method to simplify model objects definition.
   *
   * @param {String} entityName Required model name. Cannot be null or empty.
   * @param {Object} schemaDefinition Model schema definition. Cannot be null.
   * @return {Function} Returns the required model with the specified schema.
   *   Never returns null.
   */
  Model: function (entityName, schemaDefinition) {
    var Entity = Import(entityName);
    var Model;
    var schema;

    if (typeof Entity !== "function") {
      throw new Error("Entity not found: " + entityName);
    }

    if (!modelDefinitions.hasOwnProperty(entityName)) {
      schema = new mongoose.Schema(schemaDefinition);
      Model = db.model(entityName, schema);
      modelDefinitions[entityName] = {
        schema: schema,
        model: Model
      };

      Entity.prototype = Model.prototype;

      // Adds a bit of spinach to the entity :)
      Extend(Entity, Model);
    }

    return modelDefinitions[entityName].model;
  },

  /** Returns the schema for the specified entity.
   * @param {String} entityName Required entity schema. Cannot be null or
   *   empty.
   * @return {Schema} Returns the required schema, or null if it doesn't
   *   exist.
   */
  Schema: function (entityName) {
    if (modelDefinitions.hasOwnProperty(entityName)) {
      return modelDefinitions[entityName].schema;
    }
    return null;
  }
};
