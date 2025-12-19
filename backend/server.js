import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dotenvPath = path.resolve(__dirname, 'config.env');
dotenv.config({ path: dotenvPath });
console.log(`Loaded env from: ${dotenvPath}`);

// Important for ESM: load env BEFORE importing app/config that read process.env at module init.
const appModule = await import('./src/app.js');
const app = appModule.default;
const { registerCronJobs } = await import('./src/config/cron.js');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Maatram KK running on http://localhost:${PORT}`);
  registerCronJobs();
});