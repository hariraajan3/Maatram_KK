require('dotenv').config();
const http = require('http');
const app = require('./app');
const { registerCronJobs } = require('./config/cron');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Maatram KK API running on http://localhost:${PORT}`);
  registerCronJobs();
});
