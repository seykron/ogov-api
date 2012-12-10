/**
 * Extends an object with the methods and attributes from another. It
 * includes the full prototype chain. This performs only a shallow copy.
 *
 * @param  {Object} to   Object to augment. Cannot be null.
 * @param  {Object} from Object(s) to copy. Cannot be null.
 * @return {Object}      Returns the target object, for convenience.
 */
module.exports = function extend(to/**, [from]*/) {
  var property;
  var target = to;
  var from;
  var i;

  for (i = 1; i < arguments.length; i++) {
    from = arguments[i];

    for (property in from) {
      to[property] = from[property];
    }
  }

  return target;
};
