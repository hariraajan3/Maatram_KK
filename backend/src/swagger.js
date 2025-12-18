const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: { title: 'My API', description: 'Description' },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Point to your main file where routes are defined

swaggerAutogen(outputFile, endpointsFiles, doc);