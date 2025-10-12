// scripts/polyfill-crypto.js
if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
  globalThis.crypto = require('node:crypto').webcrypto;
}
