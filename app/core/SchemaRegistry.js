/** Mongoose library to access MongoDB.
 *
 * @private
 * @fieldOf OG.core.SchemaRegistry#
 */
var mongoose = require("mongoose");

/** Application data source.
 * @type ogov.core.DataSource
 * @private
 * @fieldOf ogov.core.SchemaRegistry#
 */
var DataSource = Import("ogov.core.DataSource");

/** Existing model definitions.
 * @type Object[String => Object]
 * @private
 * @fieldOf ogov.core.SchemaRegistry#
 */
var modelDefinitions = {};

module.exports = {

  /** Adds an entity into the registry.
   * @param {String} entityName Entity name, must be unique in the context.
   *    Cannot be null or empty.
   * @param {Function} entityClass Class that represents the entity. Must
   *    have a default constructor. Cannot be null.
   * @param {Object} [schemaInfo] Additional schema information, such as
   *    <code>indexes</code>. Can be null.
   */
  register: function (entityName, entityClass, schemaInfo) {
    var Entity = entityClass;
    var schema = new mongoose.Schema(new Entity());
    var Model = DataSource.createModel(entityName, schema);

    modelDefinitions[entityName] = {
      schema: schema,
      model: Model
    };

    if (schemaInfo && schemaInfo.indexes) {
      schema.index(schemaInfo.indexes);
    }

    Entity.prototype = new Model();
    Extend(Entity, Model);
  },

  /** Returns the list of existing modules in the registry.
   * @return {mongoose.Model[]} Returns a list of models. Never returns null.
   */
  listModels: function () {
    var models = [];

    for (modelName in modelDefinitions) {
      if (modelDefinitions.hasOwnProperty(modelName)) {
        models.push(modelDefinitions[modelName].model);
      }
    }

    return models;
  }
};
