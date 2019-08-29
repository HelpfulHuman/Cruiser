const PREFIXES = ["r", "webkitR", "mozR", "msR", "oR"];

declare const global: NodeJS.Global;

type NextTickFunc = (fn: Function) => void;

type HasImmediate = {
  /** Stub for `setImmediate` which is available in some browsers. */
  setImmediate: NextTickFunc;
};

/**
 * Emulates Node's `process.nextTick` method using whatever asynchronous members are available
 * with `setTimeout` being used as the end-all fallback for any environment.
 */
export const nextTick = (function () {
  const win = (typeof window !== "undefined" ? window : global);

  for (let prefix of PREFIXES) {
    let _raf = (win as unknown as { [key: string]: NextTickFunc })[`${prefix}equestAnimationFrame`];
    if (_raf) {
      return _raf.bind(win);
    }
  }

  if ((win as HasImmediate).setImmediate) {
    return (win as HasImmediate).setImmediate;
  }

  return function (fn: Function) {
    let t = setTimeout(() => {
      clearTimeout(t);
      fn();
    }, 0);
  };
})();