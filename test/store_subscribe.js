var assert = require("chai").assert;
var sinon = require("sinon");
var { createStore } = require("../");

describe("Store.subscribe()", function() {

  var initialState, store;

  beforeEach(function() {
    initialState = { foo: "bar" };
    store = createStore(initialState);
  });

  it("throws an error when a non-functional value is given", function() {
    assert.throws(function() {
      store.subscribe()
    });

    assert.throws(function() {
      store.subscribe(null)
    });

    assert.throws(function() {
      store.subscribe({})
    });

    assert.doesNotThrow(function() {
      store.subscribe(function () {})
    });
  });

  it("will only ever subscribe the same function once", function() {
    var subscriber = sinon.stub();
    store.subscribe(subscriber);
    store.subscribe(subscriber);
    store.subscribe(subscriber);
    store.subscribe(subscriber);

    store.reduce(state => state);
    store.reduce(state => state);
    store.reduce(state => state);

    assert.equal(subscriber.callCount, 3);
  });

  it("returns a function for unsubscribing the given subscriber (useful for handling anonymous function subscribers)", function() {
    var subscriber = sinon.stub();
    var unsubscribe = store.subscribe(subscriber);
    assert.isFunction(unsubscribe);

    store.reduce(state => state);
    assert.equal(subscriber.callCount, 1);

    unsubscribe();
    store.reduce(state => state);
    assert.equal(subscriber.callCount, 1);
  });

  it("receives the latest state when .reduce() is invoked", function() {
    var latestState = { bar: "baz" };
    var reducer = sinon.spy(state => latestState);
    var subscriber = sinon.spy(function(state) {
      assert.equal(state, latestState);
    });
    store.subscribe(subscriber);
    store.reduce(reducer);

    assert.equal(reducer.callCount, 1);
    assert.equal(subscriber.callCount, 1);
  });

});