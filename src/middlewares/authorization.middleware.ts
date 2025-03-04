import { NextFunction, Request, Response } from "express";
import { status } from "../FEATURES/AUTH/enums/status.enum";


export const authorization = (model,roles: string[], permissions: string[]): any => {

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
   
      console.log('req["currentUser"] :>> ', req["currentUser"]);
      const user = await model.findById(req["currentUser"].id); 
      console.log('user :>> ', user);
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
        if (!permissions.some(access => user.permissions.includes(access))) { 
          return res.status(403).json({ message: "User not permitted" });
        }
      if (user.status !== status.ACTIVE) {
        return res.status(403).json({ message: "Account not active" });
      }
    } catch (error) {
      console.log('error :>> ', error, req);
      return res.status(403).json({ message: "Denied (system error)" });
    }
    next();
  };
};