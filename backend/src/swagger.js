import swaggerAutogen from 'swagger-autogen';

const swagger = swaggerAutogen();

const doc = {
    info: { title: 'My API', description: 'Description' },
    host: 'localhost:4000'
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Point to your main file where routes are defined

swagger(outputFile, endpointsFiles, doc);