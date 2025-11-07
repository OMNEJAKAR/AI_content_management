import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Polyfill for TextEncoder/TextDecoder (needed by react-router-dom)
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set API URL for tests (used by auth.js)
globalThis.__TEST_API_URL__ = "http://localhost:5050";
