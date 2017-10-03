var assert = require("chai").assert;
var { createStore } = require("../");

describe("Store.getState()", function () {

  it("returns the initially given state by default", function() {
      var initialState = { foo: "bar" };
      var store = createStore(initialState);
      assert.equal(store.getState(), initialState);
  });

  it("returns whatever state was last provided by reducer passed to .reduce()", function() {
    var initialState = { foo: "bar" };
    var newState = { foo: "baz", bar: "bah" };
    var store = createStore(initialState);
    store.reduce(s => newState);
    assert.notEqual(store.getState(), initialState);
    assert.equal(store.getState(), newState);
  });

});