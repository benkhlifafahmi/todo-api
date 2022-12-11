import express, {Application, Request, Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';


export default function createServer() {
    const port: number = parseInt(process.env.PORT as string, 10);

    // initiate our express app.
    const app: Application = express();
    
    // configure our app to use helmet (some security header protection), cors (for cors header options.) and set it to accept JSON requests.
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    
    app.get('/', (req: Request, res: Response) => {
        return res.status(200).json({
            message: 'Hello World!'
        });
    });

    return app;
}