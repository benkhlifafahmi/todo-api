import express, {Application, NextFunction, Request, Response} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoute } from './modules/auth/auth.route';


export default function createServer() {
    const port: number = parseInt(process.env.PORT as string, 10);

    // initiate our express app.
    const app: Application = express();
    
    // configure our app to use helmet (some security header protection), cors (for cors header options.) and set it to accept JSON requests.
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    
    // setup our routes.
    app.get('/', (req: Request, res: Response) => {
        return res.status(200).json({
            message: 'Hello World!'
        });
    });
    app.use('/auth', authRoute);

    // handle errors
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        return res.status(500)
            .json({
                success: false,
                message: err.message,
                exception: err.name,
                stack: process.env.NODE_ENV === 'dev' ? err.stack : undefined,
            });
    });

    return app;
}