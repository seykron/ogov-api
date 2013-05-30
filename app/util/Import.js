/** Base directory to search for resources.
 * @type String
 * @private
 */
var baseDir = "";

/** Search for the specified class and returns a reference.
 *
 * Namespaces are resolved searching for directories from the application root
 * path, ignoring the top level namespace. For instance:
 *
 * OG.domain.Bill is mapped to app/domain/Bill.js
 *
 * @param {String} className Full namespace and name of the required class.
 *   Cannot be null or empty.
 */
module.exports = function Import(className) {
  var path = require("path");
  var dir = className.replace(/\./ig, path.sep);

  // Ignores the top-level namespace.
  dir = dir.substr(dir.indexOf(path.sep) + 1);

  return require(path.join(baseDir, dir));
};

/** Sets the base directory for the import.
 * @param {String} theBaseDir Base directory to search for resources. Cannot be
 *   null or empty.
 */
module.exports.baseDir = function (theBaseDir) {
  baseDir = theBaseDir;
};
