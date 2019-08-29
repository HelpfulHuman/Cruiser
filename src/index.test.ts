import { createStore, IStore } from "./";

type TestModel = {
  // tslint:disable-next-line: completed-docs
  count: number;
  // tslint:disable-next-line: completed-docs
  items: string[];
};

describe("createStore", () => {

  const initialState = {
    count: 0,
    items: [],
  };

  const increment = jest.fn((state: TestModel, amount = 1) => {
    return { ...state, count: state.count + amount };
  });

  let store: IStore<TestModel>;

  beforeEach(() => {
    store = createStore<TestModel>(initialState, { debug: false, bufferInterval: 0 });
    increment.mockClear();
  });

  test("getState() returns the initially given state by default but not as a direct reference", () => {
    expect(store.getState() === initialState).toBe(false);
    expect(store.getState()).toMatchObject(initialState);
  });

  test("setState() immediately sets the store's state to what is given and getState() reflects the new state", () => {
    const newState = { count: 4, items: ["foo"] };
    store.setState(newState);
    expect(store.getState()).toMatchObject(newState);
  });

  test("subscribe() will be invoked with the new state provided to setState()", (done) => {
    expect.assertions(2);
    const newState = { count: -1, items: ["bar", "baz"] };
    const sub = jest.fn((state: TestModel) => {
      expect(sub).toBeCalledTimes(1);
      expect(state).toMatchObject(newState);
      done();
    });

    store.subscribe(sub);
    store.setState(newState);
  });

  test("subscribe() does not immediately invoke the subscriber when it is added", (done) => {
    const sub1 = jest.fn();
    store.subscribe(sub1);
    setTimeout(() => {
      expect(sub1).toBeCalledTimes(0);
      done();
    }, 100);
  });

  test("subscribe() returns a function that unsubscribes that function from being called further", (done) => {
    const sub1 = jest.fn();
    const sub2 = jest.fn();

    store.subscribe(sub1);
    store.setState(initialState);
    const unsub2 = store.subscribe(sub2);
    expect(typeof unsub2).toBe("function");
    store.setState(initialState);
    store.setState(initialState);
    unsub2();
    store.setState(initialState);
    store.setState(initialState);

    setTimeout(() => {
      expect(sub1).toBeCalledTimes(5);
      expect(sub2).toBeCalledTimes(2);
      done();
    }, 250);
  });

  test("dispatch() accepts an action function with the related arguments and calls the subscriber each time (no batching)", (done) => {
    const sub = jest.fn((state: TestModel) => {
      switch (sub.mock.calls.length) {
        case 1:
          expect(state.count).toBe(1);
          break;
        case 2:
          expect(state.count).toBe(3);
          break;
        case 3:
          expect(increment).toBeCalledTimes(3);
          expect(state.count).toBe(6);
          done();
          break;
      }
    });

    expect(store.buffered).toBe(false);

    store.subscribe(sub);
    store.dispatch(increment); // increment using the default amount of 1
    store.dispatch(increment, 2);
    store.dispatch(increment, 3);
  });

  test("dispatch() accepts an action function with the related arguments and calls the subscriber once due to batching", (done) => {
    store = createStore(initialState, { debug: false, bufferInterval: 25 });

    const sub = jest.fn();

    expect(store.buffered).toBe(true);

    store.subscribe(sub);
    store.dispatch(increment); // increment using the default amount of 1
    store.dispatch(increment, 9);
    store.dispatch(increment, 0);

    setTimeout(() => {
      const state = store.getState();
      expect(increment).toBeCalledTimes(3);
      expect(sub).toBeCalledTimes(1);
      expect(state.count).toBe(10);
      done();
    }, 250);
  });

});