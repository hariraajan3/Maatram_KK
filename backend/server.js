const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });
console.log(`Loaded env from: ${dotenvPath}`);
const app = require('./src/app');
const { registerCronJobs } = require('./src/config/cron');

app.get("/",(req , res) => {
  res.send("Server is live");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Maatram KK running on http://localhost:${PORT}`);
  registerCronJobs();
});