import {Request, Response} from "express";
import * as multer from "multer";
import GrantsModel from "../schema/grants.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}
export class GrantsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        titleOfGrant,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        applyLink,
      } = req.body;

      let grant: any = {
        author: id,
        titleOfGrant,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        grant.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      console.log("req.file :>> ", req.file);

      const newGrant = new GrantsModel(grant);
      await newGrant.save();

      // Invalidate cache after creating new grant
      await invalidateCache('GRANTS');

      res
        .status(201)
        .json({message: "Grant created successfully", response: newGrant});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        titleOfGrant,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        applyLink,
      } = req.body;

      // Find the existing document by ID (passed in the route params)
      const existingGrant = await GrantsModel.findById(req.params.id);

      if (!existingGrant) {
        return res.status(404).json({error: "Grant not found"});
      }

      // Update the grant with new data
      existingGrant.titleOfGrant = titleOfGrant || existingGrant.titleOfGrant;
      existingGrant.deadline = deadline || existingGrant.deadline;
      existingGrant.summary = summary || existingGrant.summary;
      existingGrant.benefits = benefits || existingGrant.benefits;
      existingGrant.eligibility = eligibility || existingGrant.eligibility;
      existingGrant.application = application || existingGrant.application;
      existingGrant.applyLink = applyLink || existingGrant.applyLink;
      if (req.file) {
        existingGrant.image =
          `${req.file.fieldname}${req.file.filename}` || existingGrant.image;
        console.log(" existingModel.image :>> ", existingGrant.image);
      }
      // Save the updated grant
      const updatedGrant = await existingGrant.save();

      // Invalidate cache after updating grant
      await invalidateCache('GRANTS', req.params.id);
      res
        .status(200)
        .json({message: "Grant updated successfully", response: updatedGrant});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the grant by ID (passed in the route params)
      const grant = await GrantsModel.findById(req.params.id);

      if (!grant) {
        return res.status(404).json({error: "Grant not found"});
      }

      // If an image is uploaded, update the grant with the new image path
      if (req.file) {
        grant.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await grant.save(); // Save the updated grant
        res
          .status(201)
          .json({message: "Grant image updated successfully", response: grant});
      } else {
        return res.status(400).json({error: "No image uploaded"});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const key = CACHE_KEYS.GRANTS.BY_ID(req.params.id);
      const cachedData = await getCachedData(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json({message: "Data found", response: cachedData});
      }

      const grant = await GrantsModel.findById(req.params.id);

      if (!grant) {
        return res.status(404).json({error: "Grant not found"});
      }

      await setCachedData(key, grant, CACHE_DURATION.MEDIUM);
      res.status(200).json({message: "Grant found", response: grant});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = CACHE_KEYS.GRANTS.ALL;
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await GrantsModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = getUserCacheKey(CACHE_KEYS.GRANTS.ALL, id);
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: cachedData});
        }
        
        const models = await GrantsModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

         // Cache the result
         await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({message: "Data found", response: models});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the grant by ID and update its status to 'DELETED'
      const grant = await GrantsModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!grant) {
        return res.status(404).json({error: "Grant not found"});
      }

      // Invalidate cache after soft deletion
      await invalidateCache('GRANTS', req.params.id);
      res
        .status(200)
        .json({message: "Grant status updated to DELETED", response: grant});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the grant by ID (passed in the route params) and delete it permanently
      const grant = await GrantsModel.findByIdAndDelete(req.params.id);

      if (!grant) {
        return res.status(404).json({error: "Grant not found"});
      }

      res.status(200).json({message: "Grant successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }


  // public
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
            const key = CACHE_KEYS.GRANTS.PUBLIC(page, limit);

      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json(cachedData);
      }
  
      const [models, total] = await Promise.all([
        GrantsModel.find({ status: "ACTIVE" })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        GrantsModel.countDocuments({ status: "ACTIVE" }),
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
  
      // Cache the result
      await setCachedData(key, result, CACHE_DURATION.MEDIUM);
  
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
}
