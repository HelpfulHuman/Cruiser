var assert = require("chai").assert;
var sinon = require("sinon");
var { createStore } = require("../");

describe("Store.reduce()", function() {

  it("provides the initial state to the given method on the first call", function() {
    var initialState = { foo: "bar" };
    var store = createStore(initialState);
    var reducer = sinon.spy(function(state) {
      assert.equal(state, initialState);
      return state;
    });
    store.reduce(reducer);
    assert.equal(reducer.callCount, 1);
  });

  it("provides the modified state as the first argument to the reducer passed to each subsequent call", function() {
    var initialState = { counter: 1 };
    var store = createStore(initialState);
    var expectedRuns = 5;
    var counter = 1;
    var reducer = sinon.spy(function(state) {
      assert.deepEqual(state, { counter });
      counter += 3;
      return Object.assign({}, { counter });
    });

    for (var i = 0; i < expectedRuns; i++) {
      store.reduce(reducer);
    }

    assert.equal(reducer.callCount, expectedRuns);
  });

  it("returns the updated state when invoked", function() {
    var initialState = { foo: "bar" };
    var secondState  = { bar: "baz" };
    var store = createStore(initialState);

    var val1 = store.reduce(state => state);
    var val2 = store.reduce(state => secondState);

    assert.equal(val1, initialState);
    assert.equal(val2, secondState);
  });

  it("throws an error when a non-object or null value is returned from a reducer", function() {
    var store = createStore({});

    assert.throws(function() {
      store.reduce(state => false);
    }, "An object was expected to return from your middleware/reducer but \"boolean\" was returned instead.");

    assert.throws(function() {
      store.reduce(state => "string literal is not an object");
    }, "An object was expected to return from your middleware/reducer but \"string\" was returned instead.");

    assert.throws(function() {
      store.reduce(state => 42);
    }, "An object was expected to return from your middleware/reducer but \"number\" was returned instead.");

    assert.throws(function() {
      store.reduce(state => null);
    }, "An object was expected to return from your middleware/reducer but \"null\" was returned instead.");

    assert.doesNotThrow(function() {
      function ImmutableMaybe() {}
      store.reduce(state => new ImmutableMaybe());
    });

    assert.doesNotThrow(function() {
      store.reduce(state => ([]));
    });

    assert.doesNotThrow(function() {
      store.reduce(state => ({}));
    });

  });

});