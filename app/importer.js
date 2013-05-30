var OGov = require("./index")
var BillImporterJob = Import("ogov.importer.BillImporterJob");

OGov.start(function (init) {
  var job = new BillImporterJob('1 7 * * *');

  job.run();
});
