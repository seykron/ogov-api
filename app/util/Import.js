
/** Search for the specified class and returns a reference.
 *
 * Namespaces are resolved searching for directories from the application root
 * path, ignoring the top level namespace. For instance:
 *
 * OG.domain.Model is mapped to app/domain/Model.js
 *
 * @param {String} className Full namespace and name of the required class.
 *   Cannot be null or empty.
 */
module.exports = function Import(className) {
  var path = require("path");
  var dir = className.replace(/\./ig, path.sep);

  // Ignores the top-level namespace.
  dir = dir.substr(dir.indexOf(path.sep) + 1);

  return require("../" + dir);
};
