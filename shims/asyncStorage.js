// shims/asyncStorage.js

if (typeof window === "undefined") {
  // Prevent "document is not defined" errors on Netlify builds
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}
