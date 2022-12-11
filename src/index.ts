// import required libraries.
import * as dotenv from 'dotenv';
import createServer from '@app/server';
import basicAuth from 'express-basic-auth';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// load .env variables.
dotenv.config();

// check if the port variable is not available.
if (!process.env.PORT) {
    console.error('[CONFIG] we are not able to locate the PORT variable in the .env file.');
    process.exit(1);
}

// convert the port number from string -> number
const port: number = parseInt(process.env.PORT as string, 10);

// create a server instance.
const app = createServer();

// swagger setup.
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Todo APIs',
        version: '1.0.0',
    },
    servers: [
        {
            url: `http://localhost:${port}/`,
            description: 'Local Todo Server.'
        }
    ],
};
const swaggerOptions = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./src/modules/**/*.swagger.yaml'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use(
    '/docs',
    basicAuth({
        users: { 'admin': 'swagger' },
        challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec),
);

// start listening for any request.
app.listen(port, () => {
    console.info(`[APP] server is now listening on ${port}`);
});
