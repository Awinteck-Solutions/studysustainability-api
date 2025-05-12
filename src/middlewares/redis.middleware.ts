import {Request, Response, NextFunction} from "express";
import redis from "../util/redis";

export const cacheMiddleware = (): any => {
  console.log("cacheMiddleware");
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.originalUrl; // Cache based on URL 
      const cachedData = await redis.get(key);  
      if (cachedData) {
        console.log("✅ Returning cached data - middleware");
        return res.json({message: "Data found", response: cachedData});
      }
    } catch (error) {}
    // Proceed if no cache found
    next();
  };
};
