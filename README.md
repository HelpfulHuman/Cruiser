# Cruiser

Cruiser is a way of managing the state of your front-end application in a fashion similar to popular patterns like [Facebook's Flux](http://facebook.github.io/flux/) and [Redux](http://redux.js.org/).  Cruiser follows the principle of keeping your application's state in a single, immutable tree that is mutated via actions.  But where actions in Flux or Redux are dispatched as object literals that mutate the data in a "reducer" function, Cruiser opts to omit the middleman by passing the reducer function directly.

## Getting Started

Install `cruiser` via `npm`:

```
npm install --save cruiser
```

## Basic Usage Example

The first step is to create a store that will contain the "model" for your application.  It is recommended that your entire state model be contained in an object literal in a single store.  One you have a store, you can add functions to listen for state changes using the `.subscribe()` method.  For our example, we'll just output the contents of our store as a console log.

The final step is to create your reducer functions, also referred to as "actions".  Again, unlike Flux and Redux, actions and reducers are one and the same in Cruiser.  Simply create a higher-order function that accepts the necessary data for the returned reducer needs to properly change the state of your model.

To use your new action, pass the returned reducer to your store's `.reduce()` method.

```js
import cruiser from "cruiser";

// Create the store for your application's state model
const store = cruiser.createStore({
  todos: [],
});

// Subscribe to state changes
store.subscribe(function (state) {
  console.log(state);
});

// Create a couple of example actions
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

// Pass the `addTodo()` result to your store's `.reduce()` method
store.reduce(addTodo("mow the lawn"));
store.reduce(addTodo("walk the dog"));
store.reduce(removeTodo("mow the lawn"));
```

## Middleware

Crusier allows you to observe, and even modify, the state before and after your action's reducer is invoked.  This can be particularly for adding in functionality such as logging changes to the content of your store, caching state changes, or even implementing your own "time travel" functionality for state management.

To add middleware to your store, simply supply the middleware after specifying your intial state object.  The middleware will be invoked in order with the reducer function passed to `store.reduce()` being invoked at the end.

```js
import cruiser from "cruiser";

const store = cruiser.createStore({}, middlewareOne, middlewareTwo, ...);
```

Middleware in Cruiser are just functions that accept the current state of your store, followed by a `next()` function for invoking the next middleware in the chain.  After each middleware is invoked, the reducer is called and the results from that reducer works its way back up through the middleware stack.

Here's an example of an extremely basic logging function:

```js
function simpleLogger (state, next) {
  console.log("OLD STATE:", state);
  var newState = next(state);
  console.log("NEW STATE:", newState);
  return newState;
}
```

## Hard-binding Reducers

```js
import { createStore } from "cruiser";

const store = createStore({
  todos: [],
});

const addTodo = store.bindReducer(function (state, ...todos) {
  return { todos: state.todos.concat(todos) };
});

addTodo("Mow the lawn", "Walk the dog");
```