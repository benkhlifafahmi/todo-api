import Validator from '@app/helpers/validator.helper';
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateSignIn, validateSignUp } from './auth.validate';

class AuthRoute {
    router = Router();
    authController: AuthController = new AuthController();
    validator: Validator = new Validator();

    constructor() {
        this.init();
    }

    init() {
        this.router.post('/signup', this.validator.validateBody(validateSignUp), this.authController.singUp);
        this.router.post('/signin', this.validator.validateBody(validateSignIn), this.authController.singIn);
    }
}

export const authRoute = new AuthRoute().router;