// import required libraries.
import * as dotenv from 'dotenv';
import createServer from '@app/server';
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

// start listening for any request.
app.listen(port, () => {
    console.info(`[APP] server is now listening on ${port}`);
});
