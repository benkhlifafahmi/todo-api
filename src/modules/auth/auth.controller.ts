import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import bcrypt from 'bcrypt';
import TokenHelper from "@app/helpers/token.helper";

export class AuthController {
    authService: AuthService = new AuthService();
    
    tokenHelper: TokenHelper = new TokenHelper();

    constructor() {
        this.singIn = this.singIn.bind(this);
        this.singUp = this.singUp.bind(this);
    }

    async singIn(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { email, password } = req.body;
            const user = await this.authService.getUserByEmail(email);
            if (user && bcrypt.compareSync(password, user.password)) {
                const token: string = this.tokenHelper.generateToken({
                    id: user.id,
                });
                return res.status(200).json({
                    success: true,
                    code: 200,
                    token,
                    user: {
                        ...user,
                        password: undefined,
                    },
                });
            }
            return res.status(401)
                .json({
                    success: false,
                    code: 401,
                    message: 'User email/password invalid.',
                });
        } catch (err) {
            return next(err);
        }
    }

    async singUp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { email, name, password } = req.body;
            const encryptedPassword = bcrypt.hashSync(password, 10);
            const user = await this.authService.createUser(
                email,
                name,
                encryptedPassword,
            );
            return res.status(200).json({
                success: true,
                code: 200,
                user,
            });
        } catch (err) {
            return next(err);
        }
    }
}