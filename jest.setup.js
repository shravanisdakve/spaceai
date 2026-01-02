// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder for Firebase Auth in JSDOM
// Firebase Auth (via its dependencies like undici) expects these globals.
// Node.js has them in 'util' module since v11.
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill for ReadableStream (needed for Firebase Auth dependencies)
// Import from 'node:stream/web' which provides Web Streams API in Node.js
const { ReadableStream } = require('node:stream/web');
global.ReadableStream = ReadableStream;
