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
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// 1. Serve your generated swagger.json file
// Ensure this path matches the one you put in the replacement below
app.get('/swagger.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'swagger-output.json'));
});

// 2. Override the initializer file (This is where the Petstore URL actually lives)
app.get('/docs/swagger-initializer.js', (req, res) => {
    const initializerPath = path.join(pathToSwaggerUi, 'swagger-initializer.js');
    const content = fs.readFileSync(initializerPath, 'utf8')
        .replace("https://petstore.swagger.io/v2/swagger.json", "/swagger.json"); // Your API path
    res.type('application/javascript').send(content);
});

// 3. Serve the rest of the static assets
app.use('/docs', express.static(pathToSwaggerUi));

// 4. Redirect root /docs to index.html for ease of use
app.get('/docs', (req, res) => res.redirect('/docs/index.html'));
app.use(cors({ origin: ['http://localhost:4000'] }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

export default app;
