# Cruiser

Cruiser is a way of managing the state of your front-end application in a fashion similar to popular patterns like [Facebook's Flux](http://facebook.github.io/flux/) and [Redux](http://redux.js.org/).  Cruiser follows the principle of keeping your application's state in a single, immutable tree that is mutated via actions.  But where actions in Flux or Redux are dispatched as object literals that mutate the data in a "reducer" function, Cruiser opts to omit the middleman by passing the reducer function directly.

## Getting Started

Install `cruiser` via `npm`:

```
npm install --save cruiser
```

## Usage Example

The first step is to create a store that will contain the "model" for your application.  It is recommended that your entire state model be contained in an object literal in a single store.  One you have a store, you can add functions to listen for state changes using the `.subscribe()` method.  For our example, we'll just output the contents of our store as a console log.

The final step is to create your reducer functions, also referred to as "actions".  Again, unlike Flux and Redux, actions and reducers are one and the same in Cruiser.  Simply create a higher-order function that accepts the necessary data for the returned reducer needs to properly change the state of your model.

To use your new action, pass the returned reducer to your store's `.reduce()` method.

> **Note:** This library retains the `.dispatch()` method from Redux as an alias for `.reduce()` to enable the use of some existing tooling.

```js
import cruiser from "cruiser";

// Create the store for your application's state model
const store = cruiser.createStore({
  todos: [],
});

// Subscribe to state changes
store.subscribe(function (state) {
  console.log(JSON.stringify(state));
});

// Create a couple of example actions
function addTodo (task) {
  var todo = { task, completed: false };
  return function (state) {
    return { todos: state.todos.concat(todo) };
  };
}

function completeTodo (task) {
  return function (state) {
    return {
      todos: state.todos.map(function (todo) {
        return { task, complete: (todo.task === task) };
      })
    };
  }
}

// Pass the `addTodo()` result to your store's `.reduce()` method
store.reduce(addTodo("mow the lawn"));
store.reduce(addTodo("walk the dog"));
store.reduce(completeTodo("mow the lawn"));
store.reduce(addTodo("mow the lawn"));
```