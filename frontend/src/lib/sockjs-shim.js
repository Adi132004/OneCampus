const globalScope =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;

if (globalScope) {
  if (typeof globalScope.global === "undefined") {
    globalScope.global = globalScope;
  }
  if (typeof globalScope.window === "undefined" && typeof window !== "undefined") {
    globalScope.window = window;
  }
  if (typeof globalScope.self === "undefined" && typeof self !== "undefined") {
    globalScope.self = self;
  }
}

export {};
