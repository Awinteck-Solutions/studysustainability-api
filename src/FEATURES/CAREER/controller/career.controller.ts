import {Request, Response} from "express";
import * as multer from "multer";
import CareerModel from "../schema/career.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class CareerController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        titleOfPosition,
        positionOverview,
        rolesAndResponsibilities,
        idealPersonSpecifications,
        industry,
        roleLevel,
      } = req.body;

      let career: any = {
        author: id,
        titleOfPosition,
        positionOverview,
        rolesAndResponsibilities,
        idealPersonSpecifications,
        industry,
        roleLevel,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        career.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      // Create a new Career model and save it
      const newCareer = new CareerModel(career);
      await newCareer.save();

      res.status(201).json({
        message: "Career model created successfully",
        response: newCareer,
      });
    } catch (error) {
      console.log("error :>> ", error);
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const {
        titleOfPosition,
        positionOverview,
        rolesAndResponsibilities,
        idealPersonSpecifications,
        industry,
        roleLevel,
      } = req.body;

      // Find the existing Career document by ID (passed in the route params)
      const existingCareer = await CareerModel.findById(req.params.id);

      if (!existingCareer) {
        return res.status(404).json({error: "Career model not found"});
      }

      // Update the career with new data
      existingCareer.titleOfPosition =
        titleOfPosition || existingCareer.titleOfPosition;
      existingCareer.positionOverview =
        positionOverview || existingCareer.positionOverview;
      existingCareer.rolesAndResponsibilities =
        rolesAndResponsibilities || existingCareer.rolesAndResponsibilities;
      existingCareer.idealPersonSpecifications =
        idealPersonSpecifications || existingCareer.idealPersonSpecifications;
      existingCareer.industry = industry || existingCareer.industry;
      existingCareer.roleLevel = roleLevel || existingCareer.roleLevel;

      // Save the updated Career model
      const updatedCareer = await existingCareer.save();
      let key = "/careers/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res
        .status(200)
        .json({message: "Career model updated", response: updatedCareer});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the Career model by ID (passed in the route params)
      const career = await CareerModel.findById(req.params.id);

      if (!career) {
        return res.status(404).json({error: "Career model not found"});
      }

      // If an image is uploaded, update the model with the new image path
      if (req.file) {
        career.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await career.save(); // Save the updated model
        res.status(201).json({
          message: "Career image updated successfully",
          response: career,
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
            const cachedData = await redis.get(key);
            if (cachedData) {
              console.log("✅ Returning cached data");
              return res.json({message: "Data found", response: JSON.parse(cachedData)});
            }
      
      
      const career = await CareerModel.findById(req.params.id);

      if (!career) {
        return res.status(404).json({error: "Career model not found"});
      }

      await redis.setEx(key, 3600, JSON.stringify(career));
      
      res.status(200).json({message: "Career model found", response: career});
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
          return res.json({message: "Data found b", response: JSON.parse(cachedData)});
        }

        const models = await CareerModel.find({
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

        const models = await CareerModel.find({
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
      // Find the Career model by ID and update its status to 'DELETED'
      const career = await CareerModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!career) {
        return res.status(404).json({error: "Career model not found"});
      }

      let key = "/careers/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);

      res
        .status(200)
        .json({message: "Career status updated to DELETED", career});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the Career model by ID and delete it permanently
      const career = await CareerModel.findByIdAndDelete(req.params.id);

      if (!career) {
        return res.status(404).json({error: "Career model not found"});
      }

      res.status(200).json({message: "Career model successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }



  // PUBLIC ENDPOINTS
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;
  
      // Check cache first
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json(JSON.parse(cachedData));
      }
  
      const [models, total] = await Promise.all([
        CareerModel.find({ status: { $ne: "DELETED" } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        CareerModel.countDocuments({ status: { $ne: "DELETED" } }),
      ]);
  
      const result = {
        message: "Data found",
        response: models,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
  
      // Cache the result for 1 hour (3600 seconds)
      await redis.setEx(key, 3600, JSON.stringify(result));
  
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
}
