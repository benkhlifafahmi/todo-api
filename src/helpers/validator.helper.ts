/* eslint-disable consistent-return */
import { NextFunction, Request, Response } from 'express';

export default class ValidatorHelper {
  public validateBody(validator: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = await validator.validate(req.body, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map((err: any) => ({
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          code: 400,
          key: 'BadRequestException',
          message: 'Invalid Request',
          error: errorMessages,
        });
      }
      req.body = value;
      next();
    };
  }

  public validateQuery(validator: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = await validator.validate(req.query, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map((err: any) => ({
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          code: 400,
          key: 'BadRequestException',
          error: errorMessages,
        });
      }
      req.query = value;
      next();
    };
  }

  public validateParams(validator: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = await validator.validate(req.params, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map((err: any) => ({
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          code: 400,
          key: 'BadRequestException',
          error: errorMessages,
        });
      }
      req.params = value;
      next();
    };
  }

}
