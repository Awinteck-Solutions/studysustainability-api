import {NextFunction, Request, Response} from "express";
import {status} from "../FEATURES/AUTH/enums/status.enum";
import redis from "../util/redis";

export const authorization = (
  model,
  roles: string[],
  permissions: string[]
): any => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('req["currentUser"] :>> ', req["currentUser"]);
      const key = `authorization-${req["currentUser"].id}`;
      console.log("key :>> ", key); 
      let user = await cacheOrFetchMain(key, model, req["currentUser"].id)
      console.log("user-auhorization :>> ", user);

      if (!roles.includes(user.role)) {
        return res.status(403).json({message: "Forbidden"});
      }
      if (!permissions.some((access) => user.permissions.includes(access))) {
        return res.status(403).json({message: "User not permitted"});
      }
      if (user.status !== status.ACTIVE) {
        return res.status(403).json({message: "Account not active"});
      }
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(403).json({message: "Denied (system error)"});
    }
    next();
  };
};


const cacheOrFetchMain = async (key, model, id) => {

    try {
      let cachedData = await redis.get(key);
      if (cachedData) {
        console.log('✅✅cachedData :>> ', cachedData);
        return JSON.parse(cachedData);
      } else {
        const data = await model.findById(id)
        console.log('cacheOrFetchMain-data :>> ', data);
        await redis.setEx(key, 3600 * 24, JSON.stringify(data));
        return data
      }
    } catch (error) {
      console.log(error);
    }

};