import Joi from 'joi';

export const validateSignIn = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().trim().min(4)
});

export const validateSignUp = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().trim().min(4),
    name: Joi.string().trim().min(4),
});
