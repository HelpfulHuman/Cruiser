var assert = require("chai").assert;
var cruiser = require("../dist");

describe("createStore", function () {

  describe("getState()", function () {

    it ("returns the initially given state by default", function () {
      var initialState = { foo: "bar" };
      var store = cruiser.createStore(initialState);
      assert.equal(store.getState(), initialState);
    });

  });

  describe("subscribe()", function () {

    it("throws an error when a non-functional value is given");

    it("will only ever subscribe the same function once");

    it("receives the latest state when .reduce() is invoked");

  });

  describe("unsubscribe()", function () {

    it("removes the function from receiving updates about state changes");

  });

});
