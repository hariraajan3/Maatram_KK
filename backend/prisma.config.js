import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load from your config.env
dotenv.config({ path: path.resolve(__dirname, 'config.env') });

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
