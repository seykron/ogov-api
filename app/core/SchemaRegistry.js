/** Mongoose library to access MongoDB.
 *
 * @private
 * @fieldOf OG.DataSource#
 */
var mongoose = require("mongoose");

/** Application data source.
 * @type ogov.core.DataSource
 * @private
 * @fieldOf ogov.core.SchemaRegistry#
 */
var DataSource = Import("ogov.core.DataSource");

/** Mapping of existing schemas descriptions.
 * @type Object[String => Object]
 * @private
 */
var Schemas = {};

Schemas["OG.domain.Person"] = function () {
  return {
    indexes: {
      name: 1
    },
    schema: {
      name: String,
      party: String,
      province: String
    }
  };
};

Schemas["OG.domain.Bill"] = function () {
  return {
    indexes: {
      file: 1
    },
    schema: {
      type: String,
      source: String,
      file: String,
      publishedOn: String,
      creationTime: Date,
      summary: String,
      subscribers: [{ _id: mongoose.Schema.ObjectId }]
    }
  };
};

module.exports = {
  /** Registers all model entities.
   */
  register: function () {
    var modelName;
    var schemaInfo;
    var schema;

    for (modelName in Schemas) {
      if (Schemas.hasOwnProperty(modelName)) {
        schemaInfo = Schemas[modelName]();
        DataSource.Model(modelName, schemaInfo.schema);
        schema = DataSource.Schema(modelName);
        schema.index(schemaInfo.indexes);
      }
    }
  }
};
