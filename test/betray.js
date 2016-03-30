var betray = require('../');
var expect = require('chai').expect;

describe('betray', function() {
  describe('api documentation', function() {
    it('should invoke a single strategy for all calls', function() {
      var math = {
        add: function(x, y) {
          return x + y;
        }
      };

      betray(math, 'add', function(x) { return x; });
      // added has a value of 4, since the first argument is returned

      expect(math.add(4, 10)).to.equal(4);
    });

    it('should return an object if passed as strategy', function() {
      var math = {
        add: function(x, y) {
          return x + y;
        }
      };

      betray(math, 'add', 4);

      var added = math.add(4, 10);
      // added has a value of 4, since 4 is returned for every call.
      expect(added).to.equal(4);
    });

    it('should invoke matching strategy when passing a strategy array', function() {
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
      expect(addedLowerThen).to.equal(3);

      var addedGreaterThen = math.add(5, 10);
      // addedGreaterThen has a value of 10, since matchGreaterThen strategy matched which returned x
      expect(addedGreaterThen).to.equal(10);

      var addedOriginal = math.add(4, 10);
      // addedOriginal has a value of 14, since no strategy matched and the original function is invoked
      expect(addedOriginal).to.equal(14);

    })
  });

  it('should betray a function', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    var betrayedAdd = betray(math, 'add');

    var sum = math.add(1, 2);

    expect(sum).to.equal(3);
    expect(betrayedAdd.invoked).to.equal(1);
  });

  it('should betray a function with this context', function() {
    var Num = function(x) {
      this.x = x;
    };

    Num.prototype.add = function(y) {
      return this.x + y;
    };

    var num = new Num(1);

    var betrayedAdd = betray(Num.prototype, 'add');

    var sum = num.add(2);

    expect(sum).to.equal(3);
    expect(betrayedAdd.invoked).to.equal(1);
  });

  it('should restore a betrayed function', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    betray(math, 'throwError').restore();

    expect(math.throwError.restore).to.not.exist;
    expect(math.throwError).to.throw(Error);
  });

  it('should betray with strategy', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    var betrayedThrowError = betray(math, 'throwError', [{ match  : function() { return true; }, handle : function() { return 1; }}]);

    var betrayedResult = math.throwError();
    expect(betrayedResult).to.equal(1);
    expect(betrayedThrowError.invoked).to.equal(1);
  });

  it('should record arguments passed', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    var betrayedAdd = betray(math, 'add');

    var sum = math.add(1, 2);
    expect(sum).to.equal(3);

    expect(betrayedAdd.invocations.length).to.equal(1);
    expect(betrayedAdd.invocations[0][0]).to.equal(1);
    expect(betrayedAdd.invocations[0][1]).to.equal(2);
  });

  it('should offer a fluent strategy composition', function() {
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    var betrayedThrowError = betray(math, 'throwError')
      .when(function() { return true; }, function() { return 1; });

    var betrayedResult = math.throwError();
    expect(betrayedResult).to.equal(1);
    expect(betrayedThrowError.invoked).to.equal(1);
  });

  it('should implement the basic mechanisms to build mocks', function() {
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
  });

  it('should betray a function with another function', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    betray(math, 'add', function(x, y) { return x*y; });

    var multiple = math.add(2, 3);
    expect(multiple).to.equal(6);
  });

  it('should accept primitive object params to betray a function', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    betray(math, 'add', 6);

    var constant = math.add(2, 3);
    expect(constant).to.equal(6);
  });

  it('should accept object params to betray a function', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    betray(math, 'add', { result : 6 });

    var constant = math.add(2, 3);
    expect(constant).to.deep.equal({ result : 6 });
  });

  it('should expose convenience functions to betray a numbered call', function() {
    var math = {
      add: function(x, y) {
        return x + y;
      }
    };

    betray(math, 'add')
      .onFirstCall(function() { return 1; })
      .onSecondCall(function() { return 2; })
      .onThirdCall(function() { return 3; })
      .onCall(4, function() { return 4; });

    expect(math.add(2, 3)).to.equal(1);
    expect(math.add(2, 3)).to.equal(2);
    expect(math.add(2, 3)).to.equal(3);
    expect(math.add(2, 3)).to.equal(4);
  });


  it('should record and restore betrayed functions', function() {
    var betrayed = betray.record();
    var math = {
      throwError: function() {
        throw new Error('Restored');
      }
    };

    betrayed(math, 'throwError');
    betrayed.restoreAll();

    expect(math.throwError.restore).to.not.exist;
    expect(math.throwError).to.throw(Error);
  });
});