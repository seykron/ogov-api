Import = require("./util/Import")
Extend = Import("ogov.util.Extend");

var DataSource = Import("ogov.core.DataSource");
var SchemaRegistry = Import("ogov.core.SchemaRegistry");
var BillImporterJob = Import("ogov.importer.BillImporterJob");

DataSource.connect(function () {
  SchemaRegistry.register();

  var job = new BillImporterJob('1 7 * * *');

  job.run();
});
