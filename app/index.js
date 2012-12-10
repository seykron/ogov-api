var express = require("express");
var app = express();

// General configuration.
app.configure(function(){
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
});

Import = require("./util/Import")
Extend = Import("ogov.util.Extend");

var DataSource = Import("ogov.core.DataSource");

DataSource.connect(function () {
  var SchemaRegistry = Import("ogov.core.SchemaRegistry");
  var BillImporterJob = Import("ogov.importer.BillImporterJob");

  SchemaRegistry.register();

  require("./routes")(app);

  app.listen(3000);

  var job = new BillImporterJob('1 7 * * *');
  // Uncomment to import bills.
  job.run();
});
