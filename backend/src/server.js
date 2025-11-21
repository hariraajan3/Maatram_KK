const path = require('path');
const dotenvPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });
console.log(`Loaded env from: ${dotenvPath}`);
const http = require('http');
const app = require('./app');
const { registerCronJobs } = require('./config/cron');


const PORT = process.env.PORT || 4000;
if (!process.env.PORT) {
  console.warn('⚠️  PORT not set in .env, defaulting to 4000');
}

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Maatram KK API running on http://localhost:${PORT}`);
  registerCronJobs();
});