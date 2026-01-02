import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUiDist from 'swagger-ui-dist';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToSwaggerUi = swaggerUiDist.absolutePath();

const app = express();

// Enable CORS for frontend and backend origins
const allowedOrigins = [
    'http://localhost:4000',
    'http://localhost:5173',
    'https://maatram-kk.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow if no origin (like mobile apps/curl)
        if (!origin) return callback(null, true);

        // Allow if in allowedOrigins OR if it's any localhost port
        const isLocalhost = origin.startsWith('http://localhost:');
        const isAllowed = allowedOrigins.includes(origin);

        if (isLocalhost || isAllowed) {
            callback(null, true);
        } else {
            console.error('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Maatram KK API is running',
        timestamp: new Date().toISOString()
    });
});

// 1. Serve your generated swagger.json file
app.get('/swagger.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'swagger-output.json'));
});

// 2. Override the initializer file for Swagger UI
app.get('/docs/swagger-initializer.js', (req, res) => {
    const initializerPath = path.join(pathToSwaggerUi, 'swagger-initializer.js');
    const content = fs.readFileSync(initializerPath, 'utf8')
        .replace("https://petstore.swagger.io/v2/swagger.json", "/swagger.json");
    res.type('application/javascript').send(content);
});

// 3. Serve the rest of the static assets
app.use('/docs', express.static(pathToSwaggerUi));

// 4. Redirect root /docs to index.html
app.get('/docs', (req, res) => res.redirect('/docs/index.html'));

app.use('/api', routes);

app.use(errorHandler);

export default app;
