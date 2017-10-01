var assert = require("chai").assert;
var { createStore } = require("../");

describe("Store.getState()", function () {

  it("returns the initially given state by default", function() {
      var initialState = { foo: "bar" };
      var store = createStore(initialState);
      assert.equal(store.getState(), initialState);
  });

});