/** Initializes application routes.
 */
module.exports = function initialize(app) {

  var billRepository = new Import("ogov.domain.BillRepository")();
  var personRepository = new Import("ogov.domain.PersonRepository")();

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

  app.get("/api/bills/findByPerson", function (req, res, next) {
    var personId = req.query.personId;
    billRepository.findByPerson(personId, {
      fromDate: req.query.from,
      toDate: req.query.to,
      backward: req.query.backward && req.query.backward === "true"
    }, function (stream) {
      stream.pipe(res);
    });
  });

  app.get("/api/people/list", function (req, res, next) {
    personRepository.list({
      name: req.query.name,
      province: req.query.province,
      party: req.query.party
    }, function (stream) {
      stream.pipe(res);
    });
  });

  app.get("/api/people/findByParties", function (req, res, next) {
    var parties = req.query.parties || "";
    personRepository.findByParties(parties.split(","), {
      name: req.query.name,
      province: req.query.province,
      party: req.query.party
    }, function (stream) {
      stream.pipe(res);
    });
  });

  app.get("/api/people/numberOfPresentedBills", function (req, res, next) {
    personRepository.numberOfPresentedBills({
      name: req.query.name,
      province: req.query.province,
      party: req.query.party
    }, function (results) {
      res.json(results);
    });
  });
};
