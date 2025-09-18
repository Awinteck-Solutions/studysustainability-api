import {Request, Response} from "express";
import * as multer from "multer";
import CareerModel from "../schema/career.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
      // if (req.file) {
      //   career.image = `${req.file.fieldname}${req.file.filename}`;
      //   console.log("req.file.path :>> ", req.file.path);
      // }

      if (req.file) {
        const result = await uploadFile(req.file, "careers");
        if (result) {
          career.image = `${result.Key}`;
        }
      }

      // Create a new Career model and save it
      const newCareer = new CareerModel(career);
      await newCareer.save();

      // Invalidate cache after creating new career
      await invalidateCache('CAREERS');

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
      
      // Invalidate cache after updating career
      await invalidateCache('CAREERS', req.params.id);
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
        // career.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "careers");
        if (result) {
          career.image = `${result.Key}`;
        }

        await career.save(); // Save the updated model
        
        // Invalidate cache after updating image
        await invalidateCache('CAREERS', req.params.id);
        
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

        const key = CACHE_KEYS.CAREERS.BY_ID(req.params.id);
            const cachedData = await getCachedData(key);
            if (cachedData) {
              return res.json({message: "Data found", response: cachedData});
            }
      
      
      const career = await CareerModel.findById(req.params.id);

      if (!career) {
        return res.status(404).json({error: "Career model not found"});
      }

      await setCachedData(key, career, CACHE_DURATION.MEDIUM);
      
      res.status(200).json({message: "Career model found", response: career});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = CACHE_KEYS.CAREERS.ALL;

        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await CareerModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);

        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = getUserCacheKey(CACHE_KEYS.CAREERS.ALL, id);

        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await CareerModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});
        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);

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

      // Invalidate cache after soft deletion
      await invalidateCache('CAREERS', req.params.id);

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

      // Invalidate cache after permanent deletion
      await invalidateCache('CAREERS', req.params.id);

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
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const industry = req.query.industry as string;
      const roleLevel = req.query.roleLevel as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across position title, overview, and responsibilities)
      if (search) {
        query.$or = [
          { titleOfPosition: { $regex: search, $options: 'i' } },
          { positionOverview: { $regex: search, $options: 'i' } },
          { rolesAndResponsibilities: { $regex: search, $options: 'i' } },
          { idealPersonSpecifications: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (industry) {
        query.industry = { $regex: industry, $options: 'i' };
      }

      if (roleLevel) {
        query.roleLevel = { $regex: roleLevel, $options: 'i' };
      }

      // Create cache key that includes search and filter parameters
      const cacheKey = `careers_public_${page}_${limit}_${search || ''}_${industry || ''}_${roleLevel || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        CareerModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        CareerModel.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      const responsePayload = {
        message: "Data found",
        metadata: {
          total,
          page,
          limit,
          totalPages,
          filters: {
            search: search || null,
            industry: industry || null,
            roleLevel: roleLevel || null,
          }
        },
        response: models,
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      res.status(200).json(responsePayload);
      
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({error: error.message});
    }
  }
  
}
