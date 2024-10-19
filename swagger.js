const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Recipefinder 9000 API',
        description: "An API to find recipe"
    },
    host: 'localhost:8080',
    schemes: ['http', 'https']
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

// this will generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);