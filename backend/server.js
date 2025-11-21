const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });
console.log(`Loaded env from: ${dotenvPath}`);
const app = require('./src/app');


const PORT = process.env.PORT || 4000;
if (!process.env.PORT) {
  console.warn('⚠️  PORT not set in .env, defaulting to 4000');
}

const server = app.listen(PORT, () => {
  console.log(`Maatram KK API running on http://localhost:${PORT}`);
});