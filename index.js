var util = require('util');

function betray(obj, fn, strategies) {
  var origFn = obj[fn];

  if (!origFn) {
    throw new Error('Could not find a function ' + fn + ' to betray!');
  }

  if (typeof origFn != 'function') {
    throw new Error('Key ' +  fn + ' is not a function!');
  }

  strategies = strategies || [];

  if (typeof strategies == 'function') {
    strategies = [forAll(strategies)];
  } else if (!util.isArray(strategies)) {
    var result = strategies;
    strategies = [forAll(function() { return result; })];
  }

  var betrayed = function() {
    betrayed.invoked = betrayed.invoked + 1;
    betrayed.invocations.push(Array.prototype.slice.call(arguments));

    if (strategies.length > 0) {
      for (var i =0;i<strategies.length;i++) {
        if (strategies[i].match.apply(this, arguments)) {
          return strategies[i].handle.apply(this, arguments)
        }
      }

      return origFn.apply(this, arguments);
      // No strategy matched - no problem!
    } else {
      return origFn.apply(this, arguments);
    }
  };

  betrayed.invoked = 0;
  betrayed.invocations = [];

  betrayed.restore = function() {
    obj[fn] = origFn;
  };

  betrayed.when = function(match, handle) {
    strategies.push({ match : match, handle : handle });
    return betrayed;
  };

  betrayed.onCall = function(num, handle) {
    strategies.push({
      match: function() {
        return betrayed.invoked == num;
      }, handle: handle
    });

    return betrayed;
  };

  betrayed.onFirstCall = function(handle) {
    return betrayed.onCall(1, handle);
  };

  betrayed.onSecondCall = function(handle) {
    return betrayed.onCall(2, handle);
  };

  betrayed.onThirdCall = function(handle) {
    return betrayed.onCall(3, handle);
  };

  betrayed.forAll = function(handle) {
    strategies.push(forAll(handle));
  };

  obj[fn] = betrayed;

  return betrayed;
}

function forAll(handle) {
  return {
    match : function() { return true; },
    handle : handle
  }
}

function record() {
  var recorded = [];

  var tracker = function(obj, fn, strategies) {
    var betrayed = betray(obj, fn, strategies);

    recorded.push(betrayed);

    return betrayed;
  };

  tracker.restoreAll = function() {
    recorded.forEach(function(betrayed) {
      betrayed.restore();
    });
  };

  return tracker;
}

module.exports = betray;
module.exports.record = record;