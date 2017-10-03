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

  it("reports an error when a non-object or null value is returned from a reducer and returns the original value instead", function() {
    var initialState = { foo: "bar" };
    var store = createStore(initialState);
    var _cachedConsoleError = console.error;
    var catchError = sinon.spy(function(err) {
      assert.instanceOf(err, TypeError);
    });
    var dontCatchError = sinon.stub();

    console.error = catchError;

    var notBool   = store.reduce(state => (false));
    var notString = store.reduce(state => "string literal is not an object");
    var notNumber = store.reduce(state => 42);
    var notNull   = store.reduce(state => null);

    console.error = dontCatchError;

    function ImmutableMaybe() {}

    var isInstance = store.reduce(state => new ImmutableMaybe());
    var isArray    = store.reduce(state => ([])); // yes, arrays are objects
    var isObject   = store.reduce(state => ({}));

    assert.equal(catchError.callCount, 4);
    assert.equal(dontCatchError.callCount, 0);
    assert.equal(notBool, initialState);
    assert.equal(notString, initialState);
    assert.equal(notNumber, initialState);
    assert.equal(notNull, initialState);
    assert.instanceOf(isInstance, ImmutableMaybe);
    assert.isArray(isArray);
    assert.isObject(isObject);

    console.error = _cachedConsoleError;
  });

});