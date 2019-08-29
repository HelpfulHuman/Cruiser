# Cruiser

Cruiser is a way of managing the state of your front-end application in a fashion similar to popular patterns like [Facebook's Flux](http://facebook.github.io/flux/) or [Redux](http://redux.js.org/).  Cruiser follows the principle of keeping your application's state in a single, immutable tree that is mutated via "actions".  But where actions in Flux or Redux are dispatched as object literals that mutate the data in a "reducer" function, Cruiser opts to omit the middleman by making the action itself a reducer.

Some additional features about Cruiser...

- Written in Typescript and actions support explicit type-safety constraints.
- All operations are ordered and atomic.
- Updates to subscribers can be batched, allowing for a reduction in unnecessary operations.
- Provides bindings for [React](#usage-with-react).
- Extensively commented throughout, allowing for documentation via intellisense.

## Getting Started

Install `cruiser` via `npm`:

```
npm install cruiser
```

## Usage Example

> **Note:** All examples provided use Typescript, though you can still use the library without it.

The first step is to create a store that will contain the "model" for your application.  Though the model for a store can be any type, it is often preferable to use an object literal.  Additionally, Typescript users will want to create a `type` contract for their `Model` that can be used to enforce type-safety across their various actions.

One you have a store, you can add functions to listen for state changes using the `.subscribe()` method on the created store.  For our example, we'll just output the contents of our store as a console log.

The final step is to create your reducer functions, also referred to as "actions".  Again, unlike Flux and Redux, actions and reducers are one and the same in Cruiser.  Actions take the current model "state" as the first argument and return the new state.  Actions can have additional arguments that can be used to inform how the new state will be created.

Once you have an action you can update your store's current state by calling the `.dispatch()` method.  This method takes the action function as the first argument.  If your action has additional arguments, then these can be passed to the `.dispatch()` method as well, following the action.

```ts
import { createStore } from "cruiser";

/**
 * Step 1 - Create the store that will house your application's state
 * model.  Our model is incredibly simple but this structure can be
 * whatever you want it to be.  Note that it's a good idea to declare
 * your whole model up front to avoid `undefined` errors when accessing
 * unknown sub-properties.
 */
type TodosModel = {
  todos: string[];
};

const store = cruiser.createStore({
  todos: [],
});

/**
 * Step 2 - Add a subscriber to listen for changes and print out the
 * updated state when it becomes available.  Note that the `.subscribe()`
 * method returns an unsubscribe function.  This is particularly useful if
 * you're using an anonymous function that you don't have a reference to.
 */
const unsubscribe = store.subscribe((state) => {
  console.log("State Change", state);
});

/**
 * Step 3 - Create your actions.  Actions are functions that take in the
 * current state as the first argument, followed by any additional arguments
 * that your action needs.  The action then returns the next state that should
 * replace the current state of the store.  If your model is an object literal
 * you'll want to treat as an immutable value.  Some solutions to this are...
 *
 * 1. Use Typescript's property spread or `Object.assign()` for objects or
 *    sub objects and methods like `.concat()`, `.slice()` and `.filter()` for
 *    modifying arrays.
 *
 * 2. Use a library like `updeep` to do this for you.
 *
 * For the sake of demonstration, we'll be creating brand new objects every
 * time and manually modifying the `todos` array value using methods like
 * `.concat()` and `.filter()`
 */
function addTodo(state: TodosModel, todo: string): TodosModel {
  return { todos: state.todos.concat(todo) };
}

function removeTodo(state: TodosModel, todo: string): TodosModel {
  return { todos: state.todos.filter(t => t !== todo) };
}

/**
 * Step 4 - Invoke the `.dispatch()` method with the new action to create
 * a new, updated state model.
 */
store.dispatch(addTodo, "mow the lawn");
store.dispatch(addTodo, "walk the dog");
store.dispatch(removeTodo, "mow the lawn");

/**
 * Step 5 - That's it!  As a final step, we'll go ahead and unsubscribe our
 * previously added subscriber using the `unsubscribe()` method we were
 * provided earlier.
 */
unsubscribe();
```

## Buffering

When creating a store, you can optionally define a buffer interval that will enable "debouncing" of actions when greater than `0`.  What this means is that there is a window of time (the "buffer interval") when actions will be held in a queue until no more actions are dispatched, at which point it will apply all of the buffered actions and the subscribers of the store will be informed of the change only once.

> **Note:** By default, the store has a buffer interval of `25ms`.  If you wish to have immediate updates, you'll need to manually specify a buffer interval of `0`.

```ts
/**
 * This is a store with no buffer, so actions will be immediately applied
 * and subscribers of this store will be informed of the change.
 */
const noBufferStore = createStore(..., { bufferInterval: 0 });

/**
 * This is a store with a longer buffer interval of 50ms, where it every action
 * will be delayed by at least 50ms.  Once no more actions are dispatched in that
 * window, the subscribers will be notified once and only once.
 */
const bufferedStore = createStore(..., { bufferInterval: 50 });
```
