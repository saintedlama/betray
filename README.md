# Betray
Minimal test spies, stubs and mocks module

## Installation

    npm install betray

# Spies, Mocks, Stubs, ZOMBIES!

## Creating a spy

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

## Stubs
Betray does not offer a stub API or the like :disappointed:. Minimal! Better! Extensible!

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

## Mocks
As mocks are "pre-programmed with expectations which form a specification of the calls they are expected to receive" and
we betray in a minimal way we'll use chai expect syntax to create our own mock!

    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    var betrayedAdd = betray(math, 'add', [{ 
      match  : function() { this.invoked == 0 }, 
      handle : function(y) {
       expect(y).to.equal(2);
       return 1; 
      }
    },{ 
      match  : function() { this.invoked == 1 },  
      handle : function(y) {
       expect(y).to.equal(1);
       return 2; 
      }
    }
    
    ]);

    // Will not invoke the original add function but will return 1 for every call. 
    math.add(2);
    math.add(3); // Will throw because we expected second invocation to have 1 as y argument
    
