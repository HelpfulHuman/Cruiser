/**
 * This is an example of a basic "to-do" list style state model
 * with action creators.  Note that this relies on the CommonJS
 * module that is created during the build process, so make sure
 * to run the following command within the parent directory to
 * run this demo:
 *
 * `npm install && npm run build && node examples/basic_todo.js`
 */
var cruiser = require("../");

/**
 * Step 1 - Create the store that will house your application's state
 * model.  Our model is incredibly simple but this structure can be
 * whatever you want it to be.  Note that it's a good idea to declare
 * your whole model up front to avoid `undefined` errors when accessing
 * unknown sub-properties.
 *
 * Typescript Users: You can define an interface for your model and pass
 * it in as a generic using `createStore<Model>()`
 */
const store = cruiser.createStore({
  todos: [],
});

/**
 * Step 2 - Add a basic subscriber to listen for changes and print out
 * the updated state when it becomes available.  Note that the `.subscribe()`
 * method returns an unsubscribe function.  This is particularly useful if
 * you're using an anonymous function that you don't have a reference to.
 */
var unsubscribe = store.subscribe(function(state) {
  console.log("reduce -> ", state);
});

/**
 * Step 3 - Let's fire a "boot" reducer that tells our subscriber about
 * our initial state.  Reducers are used to modify your application's
 * state model.  Whatever object is returned will be the new state that replaces
 * the previous state.
 */

store.reduce(function bootReducer(state) {
  return state;
});

/**
 * Step 4 - Create your actions.  Actions are factories that generate
 * and return reducers.  You'll want to treat your state as an immutable
 * object though, so a couple ways to achieve this are...
 *
 * 1. Use `Object.assign()` and other immutable methods to create new copies
 *    of the tree's properties that you are modifying.
 *
 * 2. Use a library like `updeep` to do this for you.
 *
 * 3. Use the returned value like a "patch" object and have middleware perform
 *    the diff and immutable copying process of unchanges properties.
 *
 * For the sake of demonstration, we'll be creating brand new objects every
 * time and manually modifying the `todos` array value using methods like
 * `.concat()` and `.filter()`
 */
function addTodo(todo) {
  return function(state) {
    return { todos: state.todos.concat(todo) };
  };
}

function removeTodo(todo) {
  return function(state) {
    return { todos: state.todos.filter(t => t !== todo) };
  }
}

/**
 * Step 5 - Invoke the `.reduce()` method with the new reducer to create
 * a new, updated state model.  Note: Reduce will also return the updated
 * state when invoked.
 */
store.reduce(addTodo("mow the lawn"));
store.reduce(addTodo("walk the dog"));
store.reduce(removeTodo("mow the lawn"));

/**
 * Step 6 - That's it!  As a final step, we'll go ahead and unsubscribe our
 * previously added subscriber using the `unsubscribe()` method we were
 * provided earlier.
 */
unsubscribe();