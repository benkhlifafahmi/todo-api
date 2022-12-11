import Joi from 'joi';
// JOi for signin request schema validation.
export const validateSignIn = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().trim().min(4)
});
// JOi for signup request schema validation.
export const validateSignUp = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().trim().min(4),
    name: Joi.string().trim().min(4),
});
