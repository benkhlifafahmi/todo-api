import express from 'express';
import { JwtPayload } from 'jsonwebtoken';
import prisma from 'prisma/db';
import TokenHelper from './token.helper';

export class AuthLoader {
    tokenHelper: TokenHelper = new TokenHelper();

    init(app: express.Application) {
        app.use(async (req: any, res: express.Response, next: express.NextFunction) => {
            try {
                const { url, } = req;
                const publicUrlRegex = /^\/(auth|docs|ping)+/gi; // regex expression
                const isPublic = publicUrlRegex.test(url);
                if (!isPublic) {
                    // validate the token here.
                    const token = req.headers['x-api-key'];
                    if (!token) {
                        return res.status(401)
                            .json({
                                success: false,
                                message: 'You need to provide authentication token.',
                                code: 401,
                            });
                    }
                    const decoded: JwtPayload = this.tokenHelper.decodeToken(token) as JwtPayload;
                    if (decoded.id) {
                        const user = await prisma.user.findFirst({
                            where: {
                                id: decoded.id,
                            },
                        });
                        if (user) {
                            req.user = user;
                            return next();
                        }
                        return res.status(401)
                            .json({
                                success: false,
                                code: 401,
                                message: 'Your account has been removed, you no longer have access to this app.',
                            });
                    }
                    return res.status(401)
                        .json({
                            success: false,
                            code: 401,
                            message: 'Malformed Authentication token',
                        });
                }
                next();
            } catch (err: any) {
                if (err.name?.toLowerCase().indexOf('token') > -1) {
                    return res.status(401)
                        .json({
                            success: false,
                            code: 401,
                            message: err.message,
                            name: err.name,
                        });
                }
                return next(err);
            }
        });
    }
}