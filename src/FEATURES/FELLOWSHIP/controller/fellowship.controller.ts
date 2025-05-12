import {Request, Response} from "express";
import * as multer from "multer";
import FellowshipModel from "../schema/fellowship.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class FellowshipController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        nameOfProvider,
        titleOfFellowship,
        deadline,
        date,
        eventType,
        duration,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      let fellowshipData: any = {
        author: id,
        nameOfProvider,
        titleOfFellowship,
        deadline,
        date,
        eventType,
        duration,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        fellowshipData.image = `${req.file.fieldname}${req.file.filename}`;
      }

      // Create a new Fellowship model and save it
      const newFellowship = new FellowshipModel(fellowshipData);
      await newFellowship.save();

      res.status(201).json({
        message: "Fellowship created successfully",
        response: newFellowship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        nameOfProvider,
        titleOfFellowship,
        deadline,
        date,
        eventType,
        duration,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      // Find the existing Fellowship document by ID (passed in the route params)
      const existingFellowship = await FellowshipModel.findById(req.params.id);

      if (!existingFellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }

      // Update the fellowship with new data
      existingFellowship.titleOfFellowship =
        titleOfFellowship || existingFellowship.titleOfFellowship;
      existingFellowship.nameOfProvider =
        nameOfProvider || existingFellowship.nameOfProvider;
      existingFellowship.date =
      date || existingFellowship.date;
      existingFellowship.eventType =
      eventType || existingFellowship.eventType;
      existingFellowship.duration =
      duration || existingFellowship.duration;
      existingFellowship.deadline = deadline || existingFellowship.deadline;
      existingFellowship.summary = summary || existingFellowship.summary;
      existingFellowship.benefits = benefits || existingFellowship.benefits;
      existingFellowship.eligibility =
        eligibility || existingFellowship.eligibility;
      existingFellowship.application =
        application || existingFellowship.application;
      existingFellowship.moreInfoLink =
        moreInfoLink || existingFellowship.moreInfoLink;
      existingFellowship.applyLink = applyLink || existingFellowship.applyLink;
      if (req.file) {
        existingFellowship.image =
          `${req.file.fieldname}${req.file.filename}` || existingFellowship.image;
        console.log(" existingModel.image :>> ", existingFellowship.image);
      }
      // Save the updated Fellowship model
      const updatedFellowship = await existingFellowship.save();
      let key = "/fellowships/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res
        .status(200)
        .json({message: "Fellowship updated", response: updatedFellowship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the Fellowship model by ID (passed in the route params)
      const fellowship = await FellowshipModel.findById(req.params.id);

      if (!fellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }

      // If an image is uploaded, update the model with the new image path
      if (req.file) {
        fellowship.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await fellowship.save(); // Save the updated model
        res.status(201).json({
          message: "Fellowship image updated successfully",
          response: fellowship,
        });
      } else {
        return res.status(400).json({error: "No image uploaded"});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const key = req.originalUrl;
      // Check cache first
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json({message: "Data found", response: JSON.parse(cachedData)});
      }

      const fellowship = await FellowshipModel.findById(req.params.id);

      if (!fellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }

       // Cache the result for 1 hour (3600 seconds)
       await redis.setEx(key, 3600, JSON.stringify(fellowship));
      res.status(200).json({message: "Fellowship found", response: fellowship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await FellowshipModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

         // Cache the result for 1 hour (3600 seconds)
         await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await FellowshipModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

         // Cache the result for 1 hour (3600 seconds)
         await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the Fellowship model by ID and update its status to 'DELETED'
      const fellowship = await FellowshipModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!fellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }


      let key = "/fellowships/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res
        .status(200)
        .json({message: "Fellowship status updated to DELETED", fellowship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the Fellowship model by ID and delete it permanently
      const fellowship = await FellowshipModel.findByIdAndDelete(req.params.id);

      if (!fellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }

      res.status(200).json({message: "Fellowship successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }


  // PUBLIC
  static async getAllPublic(req: Request, res: Response) {
    try {
     
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await FellowshipModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

         // Cache the result for 1 hour (3600 seconds)
         await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }
}
