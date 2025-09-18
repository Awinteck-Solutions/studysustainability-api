import {Request, Response} from "express";
import * as multer from "multer";
import ScholarshipsModel from "../schema/scholarships.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}
export class ScholarshipsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      let scholarship: any = {
        author: id,
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline: deadline && deadline !== "null" ? new Date(deadline) : null,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        // scholarship.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "scholarships");
        if (result) {
          scholarship.image = `${result.Key}`;
        }
      }

      const newScholarship = new ScholarshipsModel(scholarship);
      await newScholarship.save();

      // Invalidate cache after creating new scholarship
      await invalidateCache('SCHOLARSHIPS');

      res.status(201).json({
        message: "Scholarship created successfully",
        response: newScholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      // Find the existing scholarship by ID
      const existingScholarship = await ScholarshipsModel.findById(
        req.params.id
      );

      if (!existingScholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // Update the scholarship with new data
      existingScholarship.titleOfScholarship =
        titleOfScholarship || existingScholarship.titleOfScholarship;
      existingScholarship.nameOfProvider =
        nameOfProvider || existingScholarship.nameOfProvider;
      existingScholarship.scholarshipType =
        scholarshipType || existingScholarship.scholarshipType;
      existingScholarship.deadline = deadline && deadline !== "null" ? new Date(deadline) : existingScholarship.deadline;
      existingScholarship.summary = summary || existingScholarship.summary;
      existingScholarship.benefits = benefits || existingScholarship.benefits;
      existingScholarship.eligibility =
        eligibility || existingScholarship.eligibility;
      existingScholarship.application =
        application || existingScholarship.application;
      existingScholarship.moreInfoLink =
        moreInfoLink || existingScholarship.moreInfoLink;
      existingScholarship.applyLink =
        applyLink || existingScholarship.applyLink;
      if (req.file) {
        // existingScholarship.image =
        //   `${req.file.fieldname}${req.file.filename}` ||
        //   existingScholarship.image;
        const result = await uploadFile(req.file, "scholarships");
        if (result) {
          existingScholarship.image = `${result.Key}`;
        }
      }
      // Save the updated scholarship
      const updatedScholarship = await existingScholarship.save();

      // Invalidate cache after updating scholarship
      await invalidateCache('SCHOLARSHIPS', req.params.id);
      res.status(200).json({
        message: "Scholarship updated successfully",
        response: updatedScholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the scholarship by ID
      const scholarship = await ScholarshipsModel.findById(req.params.id);

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // If an image is uploaded, update the scholarship with the new image path
      if (req.file) {
        // scholarship.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "scholarships");
        if (result) {
          scholarship.image = `${result.Key}`;
        }
        await scholarship.save(); // Save the updated scholarship
        
        // Invalidate cache after updating image
        await invalidateCache('SCHOLARSHIPS', req.params.id);
        
        res.status(201).json({
          message: "Scholarship image updated successfully",
          response: scholarship,
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
      const key = CACHE_KEYS.SCHOLARSHIPS.BY_ID(req.params.id);
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json({
          message: "Data found",
          response: cachedData,
        });
      }

      const scholarship = await ScholarshipsModel.findById(req.params.id);

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // Cache the result
      await setCachedData(key, scholarship, CACHE_DURATION.MEDIUM);
      res
        .status(200)
        .json({message: "Scholarship found", response: scholarship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = CACHE_KEYS.SCHOLARSHIPS.ALL;
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({
            message: "Data found",
            response: cachedData,
          });
        }

        const models = await ScholarshipsModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = getUserCacheKey(CACHE_KEYS.SCHOLARSHIPS.ALL, id);
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({
            message: "Data found",
            response: cachedData,
          });
        }

        const models = await ScholarshipsModel.find({
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
      // Find the scholarship by ID and update its status to 'DELETED'
      const scholarship = await ScholarshipsModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // Invalidate cache after soft deletion
      await invalidateCache('SCHOLARSHIPS', req.params.id);
      res.status(200).json({
        message: "Scholarship status updated to DELETED",
        response: scholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the scholarship by ID (passed in the route params) and delete it permanently
      const scholarship = await ScholarshipsModel.findByIdAndDelete(
        req.params.id
      );

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      res.status(200).json({message: "Scholarship successfully deleted"});
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
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const scholarshipType = req.query.scholarshipType as string;
      const nameOfProvider = req.query.nameOfProvider as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across title, provider, and summary)
      if (search) {
        query.$or = [
          { titleOfScholarship: { $regex: search, $options: 'i' } },
          { nameOfProvider: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { benefits: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (scholarshipType) {
        query.scholarshipType = { $regex: scholarshipType, $options: 'i' };
      }

      if (nameOfProvider) {
        query.nameOfProvider = { $regex: nameOfProvider, $options: 'i' };
      }

      // Filter out expired deadlines unless explicitly requested
      if (includeExpired !== 'true') {
        query.$and = [
          {
            $or: [
              { deadline: { $exists: false } },
              { deadline: null },
              { deadline: { $gte: new Date() } }
            ]
          }
        ];
      }

      // Create cache key that includes search and filter parameters
      const cacheKey = `scholarships_public_${page}_${limit}_${search || ''}_${scholarshipType || ''}_${nameOfProvider || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        ScholarshipsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ScholarshipsModel.countDocuments(query)
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
            scholarshipType: scholarshipType || null,
            nameOfProvider: nameOfProvider || null,
            includeExpired: includeExpired === 'true' || null,
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
