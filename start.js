#!/usr/bin/node
var OGov = require("./app");
var express = require("express");
var app = express();

// General configuration.
app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(app.router);
});

OGov.start(function (init) {
  init(app)
  app.listen(3000);
});
