import {Request, Response} from "express";
import * as multer from "multer";
import FellowshipModel from "../schema/fellowship.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
import InterestForm from "../../INTERESTFORM/schema/InterestForm.schema";
import Engagement from "../../Engagement/schema/Engagement.schema";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
        deadline: deadline && deadline !== "null" ? new Date(deadline) : null,
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
        // fellowshipData.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "fellowships");
        if (result) {
          fellowshipData.image = `${result.Key}`;
        }
      }

      // Create a new Fellowship model and save it
      const newFellowship = new FellowshipModel(fellowshipData);
      await newFellowship.save();

      // Invalidate cache after creating new fellowship
      await invalidateCache('FELLOWSHIPS');

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
      existingFellowship.deadline = deadline && deadline !== "null" ? new Date(deadline) : existingFellowship.deadline;
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
        // existingFellowship.image =
        //   `${req.file.fieldname}${req.file.filename}` || existingFellowship.image;
        const result = await uploadFile(req.file, "fellowships");
        if (result) {
          existingFellowship.image = `${result.Key}`;
        }
      }
      // Save the updated Fellowship model
      const updatedFellowship = await existingFellowship.save();
      
      // Invalidate cache after updating fellowship
      await invalidateCache('FELLOWSHIPS', req.params.id);
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
        // fellowship.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "fellowships");
        if (result) {
          fellowship.image = `${result.Key}`;
        }
        await fellowship.save(); // Save the updated model
        
        // Invalidate cache after updating image
        await invalidateCache('FELLOWSHIPS', req.params.id);
        
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
      const key = CACHE_KEYS.FELLOWSHIPS.BY_ID(req.params.id);
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({message: "Data found", response: cachedData});
      }

      const fellowship = await FellowshipModel.findById(req.params.id);

      if (!fellowship) {
        return res.status(404).json({error: "Fellowship not found"});
      }

       // Cache the result for 1 hour
       await setCachedData(key, fellowship, CACHE_DURATION.MEDIUM);
      res.status(200).json({message: "Fellowship found", response: fellowship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination
        const cacheKey = `fellowships_admin_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          FellowshipModel.find({
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          FellowshipModel.countDocuments({status: {$ne: "DELETED"}})
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
              status: "ACTIVE,INACTIVE,REJECTED"
            }
          },
          response: models,
        };

         // Cache the result for 1 hour
         await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // Create cache key with pagination for user-specific data
        const cacheKey = `fellowships_user_${id}_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          FellowshipModel.find({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          FellowshipModel.countDocuments({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"}
          })
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
              status: "ACTIVE,INACTIVE,REJECTED"
            }
          },
          response: models,
        };

         // Cache the result for 1 hour
         await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
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

      // Invalidate cache after soft deletion
      await invalidateCache('FELLOWSHIPS', req.params.id);
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

      // Invalidate cache after permanent deletion
      await invalidateCache('FELLOWSHIPS', req.params.id);

      res.status(200).json({message: "Fellowship successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }


  // PUBLIC
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const nameOfProvider = req.query.nameOfProvider as string;
      const eventType = req.query.eventType as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across title, provider, and summary)
      if (search) {
        query.$or = [
          { titleOfFellowship: { $regex: search, $options: 'i' } },
          { nameOfProvider: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { benefits: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (nameOfProvider) {
        query.nameOfProvider = { $regex: nameOfProvider, $options: 'i' };
      }

      if (eventType) {
        query.eventType = { $regex: eventType, $options: 'i' };
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
      const cacheKey = `fellowships_public_${page}_${limit}_${search || ''}_${nameOfProvider || ''}_${eventType || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        FellowshipModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        FellowshipModel.countDocuments(query)
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
            nameOfProvider: nameOfProvider || null,
            eventType: eventType || null,
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

  // GET FELLOWSHIPS STATISTICS
  static async getStats(req: Request, res: Response) {
    try {
      const { role } = req["currentUser"];
      
      // Only allow ADMIN role to access statistics
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const cacheKey = 'fellowships_stats';
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get statistics
      const [
        totalFellowships,
        activeFellowships,
        inactiveFellowships,
        typeStats,
        providerStats,
        recentFellowships,
        totalEnrolled,
        totalEngagements
      ] = await Promise.all([
        FellowshipModel.countDocuments({  status: { $ne: "DELETED" }}),
        FellowshipModel.countDocuments({ status: "ACTIVE" }),
        FellowshipModel.countDocuments({ status: "INACTIVE" }),
        FellowshipModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$eventType", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        FellowshipModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$nameOfProvider", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        FellowshipModel.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        }),
        InterestForm.countDocuments({ status: "ACTIVE", menu: 'Fellowship' }),
        Engagement.countDocuments({ itemType: 'FELLOWSHIP' })
      ]);

      const stats = {
        totalFellowships,
        activeFellowships,
        inactiveFellowships,
        typeBreakdown: typeStats.map(stat => ({
          type: stat._id,
          count: stat.count
        })),
        providerBreakdown: providerStats.map(stat => ({
          provider: stat._id,
          count: stat.count
        })),
        recentFellowships, // Fellowships created in last 7 days
        statusBreakdown: {
          active: activeFellowships,
          inactive: inactiveFellowships
        },
        // Additional platform statistics
        totalEnrolled, // Total active interest form submissions for fellowships
        totalEngagements // Total engagement records for fellowships
      };

      const responsePayload = {
        status: true,
        message: "Fellowships statistics retrieved successfully",
        response: stats,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: req["currentUser"].id
        }
      };

      // Cache the result for 30 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      
      return res.status(200).json(responsePayload);
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  
}
