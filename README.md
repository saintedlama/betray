# Betray
[![Build Status](https://travis-ci.org/saintedlama/betray.svg?branch=master)](https://travis-ci.org/saintedlama/betray)

Minimal test spies, stubs and mocks module.

## Installation

    npm install betray

# Spies, Mocks, Stubs, ZOMBIES!

## Creating a spy

```javascript
var betray = require('betray');

var math = {
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
