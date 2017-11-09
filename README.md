# Betray
[![Build Status](https://travis-ci.org/saintedlama/betray.svg?branch=master)](https://travis-ci.org/saintedlama/betray)
[![Coverage Status](https://coveralls.io/repos/github/saintedlama/betray/badge.svg?branch=master)](https://coveralls.io/github/saintedlama/betray?branch=master)
[![betray analyzed by Codellama.io](https://app.codellama.io/api/badges/5a0438e31b4c363a0f9427c4/bb531760d98c287942b441dc779e2988)](https://app.codellama.io/repositories/5a0438e31b4c363a0f9427c4)

Minimal test spies, stubs and mocks module.

## Installation

    npm install betray

# Spies, Mocks, Stubs, ZOMBIES!

## Creating a spy

```javascript
const betray = require('betray');

const math = {
  add: function(x, y) {
    return x + y;
  }
};

var betrayedAdd = betray(math, 'add');

var sum = math.add(1, 2);

// Original function was invoked and spies invocation counter incremented
expect(sum).to.equal(3);
expect(betrayedAdd.invoked).to.equal(1);
```

## Stubs

Betray does not offer a stub API or the like :disappointed:. Minimal! Better! Extensible! :dancers:

```javascript
var math = {
  add: function(x, y) {
    return x + y;
  }
};

var betrayedAdd = betray(math, 'add', [{ match  : function() { return true; }, handle : function() { return 1; }}]);

// Will not invoke the original add function but will return 1 for every call. 
var betrayedResult = math.add();
expect(betrayedResult).to.equal(1);

// Invocation counter is incremented as well
expect(betrayedThrowError.invoked).to.equal(1);
```

**simpler**

```javascript
var math = {
  add: function(x, y) {
    return x + y;
  }
};

var betrayedAdd = betray(math, 'add', function() { return 1; }); // Returns 1 for all calls

// Will not invoke the original add function but will return 1 for every call. 
var betrayedResult = math.add();
expect(betrayedResult).to.equal(1);

// Invocation counter is incremented as well
expect(betrayedThrowError.invoked).to.equal(1);
```

**even simpler**

```javascript
var math = {
  add: function(x, y) {
    return x + y;
  }
};

var betrayedAdd = betray(math, 'add', 1); // Returns 1

// Will not invoke the original add function but will return 1 for every call. 
var betrayedResult = math.add();
expect(betrayedResult).to.equal(1);

// Invocation counter is incremented as well
expect(betrayedThrowError.invoked).to.equal(1);
```

## Mocks

As mocks are "pre-programmed with expectations which form a specification of the calls they are expected to receive" and
we betray in a minimal way we'll use chai expect syntax to create our own mock!

```javascript
var math = {
  add: function(x, y) {
    return x + y;
  }
};

betray(math, 'add', [{
  match  : function() { return this.add.invoked == 1 },
  handle : function(y) {
    expect(y).to.equal(2);
    return 1;
  }
},{
  match  : function() { return this.add.invoked == 2 },
  handle : function(y) {
    expect(y).to.equal(3);
    return 2;
  }
}]);

// Will not invoke the original add function but will return 1 for every call.
math.add(2);
math.add(3);
```

**simpler**

Betray implements some convenience functions to match specific calls
 
* onFirstCall(fn)
* onSecondCall(fn)
* onThirdCall(fn)
* onCall(num, fn)

```javascript
var math = {
  add: function(x, y) {
    return x + y;
  }
};

betray(math, 'add')
  .onFirstCall(function(y) {
    expect(y).to.equal(2);
    return 1;
  })
  .onSecondCall(function(y) {
    expect(y).to.equal(3);
    return 2;
  });

// Will not invoke the original add function but will return 1 for every call.
math.add(2);
math.add(3);
```

## Tests and restoring

When using betray in for example mocha you might want to betray some functionality **before** running tests and to 
restore all betrayed functionality **after** running tests. Betray is here to help:

```js
const betray = require('betray');

describe('something', () => {
    let betrayed;

    beforeEach(() => { betrayed = betray.record(); });
    afterEach(() => betrayed.restoreAll());

    it('should do something', () => {
        // Use betrayed instead of betray
    });
});
```

Never forget restoring betrayed functions again :clap:

# API documentation

Code examples are runnable mocha tests in tests/betray.js

### betray(object, functionName, strategies)
Betray a function named `functionName` of object `object` and return the betrayed function.

Strategies accepts a `function`, `object` or an array. If a function is specified this function is invoked
whenever the original function (object and functionName) are invoked with all parameters of the original function call. If 
an object is passed this object is returned for every function call of the original function instead invoking the original 
function.
If an array is passed betray expects each item to expose a `match` and `handle` function. `match` is called with the arguments
of the original function and only if `match` returns a truthy value `handle` is called. In case match matches a function
call the strategy evaluation breaks. The original function is not called.

**Strategy Examples**

**Passing a single function**

```
var betray = require('betray');
var math = {
  add: function(x, y) {
    return x + y;
  }
};

betray(math, 'add', function(x) { return x; });
// added has a value of 4, since the first argument is returned
```

**Passing an object**

```
var betray = require('betray');
var math = {
  add: function(x, y) {
    return x + y;
  }
};

betray(math, 'add', 4);

var added = math.add(4, 10);
// added has a value of 4, since 4 is returned for every call.
```

**Passing a function array**

```
var betray = require('betray');
var math = {
  add: function(x, y) {
    return x + y;
  }
};

// For all x values lower than 4 return x
var matchLowerThen = {
  match: function(x, y) {
    return x < 4;
  },

  handle: function(x, y) {
    return x;
  }
};

// For all x values greater than 4 return y
var matchGreaterThen = {
  match: function(x, y) {
    return x > 4;
  },

  handle: function(x, y) {
    return y;
  }
};

betray(math, 'add', [matchLowerThen, matchGreaterThen]);

var addedLowerThen = math.add(3, 10);
// addedLowerThen has a value of 3, since matchLowerThen strategy matched which returned x

var addedGreaterThen = math.add(5, 10);
// addedGreaterThen has a value of 10, since matchGreaterThen strategy matched which returned x

var addedOriginal = math.add(4, 10);
// addedOriginal has a value of 14, since no strategy matched and the original function is invoked
```


### betray.record()
Returns an instance of betray that records betrayed functions and exposes a `restoreAll` function to restore all betrayed functions.

### betrayed

#### betrayed.invoked
TBD

#### betrayed.invocations
TBD

#### betrayed.restore
TBD

#### betrayed.when
TBD

#### betrayed.onCall
TBD

#### betrayed.onFirstCall
TBD

#### betrayed.onSecondCall
TBD

#### betrayed.onThirdCall
TBD

#### betrayed.forAll
TBD

