/**
 * Creates and returns a new store for an application model.
 *
 * @param {*} initialState
 */
export function createStore (initialState = {}) {
  var currentState = initialState;
  var subscribers = [];
  var store = {
    /**
     * Subscribes the given function to state changes.
     *
     * @param {Function} fn
     */
    subscribe (fn) {
      if (
        typeof fn === "function" &&
        subscribers.indexOf(fn) === -1
      ) {
        subscribers.push(fn);
      }
    },
    /**
     * Unsubscribes the given function from state changes.
     *
     * @param {Function} fn
     */
    unsubscribe (fn) {
      var i = subscribers.indexOf(fn);
      if (i !== -1) {
        subscribers.splice(i, 1);
      }
    },
    /**
     * Returns the store's most current state.
     *
     * @return {*}
     */
    getState () {
      return currentState;
    },
    /**
     * Passes the current state to the given reducer, updates the stored state and
     * informs subscribers of the change.
     *
     * @param {Function} reducer
     */
    reduce (reducer) {
      if (typeof reducer !== "function") {
        throw new Error("store.reduce requires a valid function with a signature of state->state");
      }
      // Alter the current state of the store using the given reducer
      currentState = reducer(currentState);
      // Inform subscribers of the state change
      for (var i = 0; i < subscribers.length; i++) {
        subscribers[i](currentState);
      }
    },
    /**
     * Alias for "reduce()".
     *
     * @param {Function} reducer
     */
    dispatch (reducer) {
      store.reduce(reducer);
    },
  };

  return store;
}
