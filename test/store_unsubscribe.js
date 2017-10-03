var assert = require("chai").assert;
var sinon = require("sinon");
var { createStore } = require("../");

describe("Store.unsubscribe()", function() {

  var initialState, store;

  beforeEach(function() {
    initialState = { foo: "bar" };
    store = createStore(initialState);
  });

  it("removes the function from receiving updates about state changes", function() {
    var subscriber = sinon.stub();
    store.subscribe(subscriber);
    store.reduce(state => state);
    store.unsubscribe(subscriber);
    store.reduce(state => state);
    store.reduce(state => state);

    assert.equal(subscriber.callCount, 1);
  });

  it("doesn't throw an error if the subscriber is not set or is already removed", function() {
    var subscriber = sinon.stub();

    assert.doesNotThrow(function() {
      store.unsubscribe(x => x);
    });

    assert.doesNotThrow(function() {
      store.subscribe(subscriber);
      store.unsubscribe(subscriber);
      store.unsubscribe(subscriber);
      store.unsubscribe(subscriber);
    });
  });

});