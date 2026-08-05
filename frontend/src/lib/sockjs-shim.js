if (typeof global === 'undefined' && typeof globalThis !== 'undefined') {
  globalThis.global = globalThis;
}

if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

export {};
