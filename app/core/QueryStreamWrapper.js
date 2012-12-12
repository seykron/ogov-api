/** Wraps mongoose QueryStream in order to emit a Buffer instead of an object
 * as it's expected by WritableStream.
 *
 * @param {mongoose.QueryStream} queryStream Query stream to wrap. Cannot be
 *   null.
 * @constructor
 * @name ogov.core.QueryStreamWrapper
 */
module.exports = function QueryStreamWrapper(queryStream) {

  var Stream = require("stream");
  var stream = new Stream();

  queryStream.on('data', function (doc) {
    stream.emit("data", JSON.stringify(doc));
  }).on('error', function (err) {
    stream.emit("error", err);
  }).on('close', function () {
    stream.emit("close");
  });

  return stream;
};
