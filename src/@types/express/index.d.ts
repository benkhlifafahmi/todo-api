import { IUser } from "@app/interfaces/User";

export {};

declare global {
  namespace Express {
    interface Request {
      user: IUser,
    }
  }
}
