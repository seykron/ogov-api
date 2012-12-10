/** Initializes application routes.
 */
module.exports = function initialize(app) {

  var billRepository = new Import("ogov.domain.BillRepository")();

  app.get("/api/bills/list", function (req, res, next) {
    billRepository.list({
      fromDate: req.query.from,
      toDate: req.query.to,
      backward: req.query.backward && req.query.backward === "true"
    }, function (stream) {
      stream.pipe(res);
    });
  });

  app.get("/api/bills/findByParties", function (req, res, next) {
    var parties = req.query.parties || "";
    billRepository.findByParties(parties.split(","), {
      fromDate: req.query.from,
      toDate: req.query.to,
      backward: req.query.backward && req.query.backward === "true"
    }, function (stream) {
      stream.pipe(res);
    });
  });
};
