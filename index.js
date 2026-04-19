import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// This file acts as a proxy for Render's default 'node index.js' command
console.log("Starting server from root proxy...");
require('./server/index.js');
