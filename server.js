// Root shim so platforms that run `node server.js` from repo root work.
// Forwards execution to backend/server.js

try {
  require('./backend/server.js');
} catch (err) {
  console.error('Failed to load backend/server.js from root server.js shim:', err);
  throw err;
}
