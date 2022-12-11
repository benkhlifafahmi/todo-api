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

    // controller function to handle the user login.
    async singIn(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { email, password } = req.body;
            // search if there is any user registered with the provided email.
            const user = await this.authService.getUserByEmail(email);
            // check if the user exist and the password is correct.
            if (user && bcrypt.compareSync(password, user.password)) {
                // generate JWT token for the user.
                const token: string = this.tokenHelper.generateToken({
                    id: user.id,
                });
                // return a response with the user object and the JWT token (remove the password from the user object.).
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
            // it's either the user doesn't exist or password is invalid.
            return res.status(401)
                .json({
                    success: false,
                    code: 401,
                    message: 'User email/password invalid.',
                });
        } catch (err) {
            // there was an issue while attempting to authenticate the user.
            return next(err);
        }
    }

    // controller function to handle the user register.
    async singUp(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { email, name, password } = req.body;
            // check if there is an already user registered with the provided email.
            const userExist = await this.authService.getUserByEmail(email);
            // if the user exist with the provided email we should raise an error.
            if (userExist) {
                return res.status(401)
                    .json({
                        success: false,
                        code: 401,
                        message: 'Email already exist',
                    })
            }
            // encrypt the user password input.
            const encryptedPassword = bcrypt.hashSync(password, 10);
            // create a new user entry (email, name, password).
            const user = await this.authService.createUser(
                email,
                name,
                encryptedPassword,
            );
            // return a response with the user object (id, email, name)
            return res.status(200).json({
                success: true,
                code: 200,
                user,
            });
        } catch (err) {
            // there was an error while registering the user.
            return next(err);
        }
    }
}