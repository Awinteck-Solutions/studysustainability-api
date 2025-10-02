import {Request, Response} from "express";
import * as multer from "multer";
import GrantsModel from "../schema/grants.schema";
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
        deadline: deadline && deadline !== "null" ? new Date(deadline) : null,
        summary,
        benefits,
        eligibility,
        application,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        // grant.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "grants");
        if (result) {
          grant.image = `${result.Key}`;
        }
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
      existingGrant.deadline = deadline && deadline !== "null" ? new Date(deadline) : existingGrant.deadline;
      existingGrant.summary = summary || existingGrant.summary;
      existingGrant.benefits = benefits || existingGrant.benefits;
      existingGrant.eligibility = eligibility || existingGrant.eligibility;
      existingGrant.application = application || existingGrant.application;
      existingGrant.applyLink = applyLink || existingGrant.applyLink;
      if (req.file) {
        // existingGrant.image =
        //   `${req.file.fieldname}${req.file.filename}` || existingGrant.image;
        const result = await uploadFile(req.file, "grants");
        if (result) {
          existingGrant.image = `${result.Key}`;
        }
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
        // grant.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "grants");
        if (result) {
          grant.image = `${result.Key}`;
        }
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination
        const cacheKey = `grants_admin_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          // console.log("✅ Returning cached data");
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          GrantsModel.find({
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          GrantsModel.countDocuments({status: {$ne: "DELETED"}})
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

        // Cache the result
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // Create cache key with pagination for user-specific data
        const cacheKey = `grants_user_${id}_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          // console.log("✅ Returning cached data");
          return res.json(cachedData);
        }
        
        const [models, total] = await Promise.all([
          GrantsModel.find({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          GrantsModel.countDocuments({
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

         // Cache the result
         await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
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
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across title, summary, and benefits)
      if (search) {
        query.$or = [
          { titleOfGrant: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } },
          { benefits: { $regex: search, $options: 'i' } },
          { eligibility: { $regex: search, $options: 'i' } }
        ];
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
      const cacheKey = `grants_public_${page}_${limit}_${search || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        GrantsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        GrantsModel.countDocuments(query)
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

  // GET GRANTS STATISTICS
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

      const cacheKey = 'grants_stats';
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get statistics
      const [
        totalGrants,
        activeGrants,
        inactiveGrants,
        recentGrants,
        totalEnrolled,
        totalEngagements
      ] = await Promise.all([
        GrantsModel.countDocuments({  status: { $ne: "DELETED" }}),
        GrantsModel.countDocuments({ status: "ACTIVE" }),
        GrantsModel.countDocuments({ status: "INACTIVE" }),
        GrantsModel.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        }),
        InterestForm.countDocuments({ status: "ACTIVE", menu: 'Grants' }),
        Engagement.countDocuments({ itemType: 'GRANTS' })
      ]);

      const stats = {
        totalGrants,
        activeGrants,
        inactiveGrants,
        recentGrants, // Grants created in last 7 days
        statusBreakdown: {
          active: activeGrants,
          inactive: inactiveGrants
        },
        // Additional platform statistics
        totalEnrolled, // Total active interest form submissions for grants
        totalEngagements // Total engagement records for grants
      };

      const responsePayload = {
        status: true,
        message: "Grants statistics retrieved successfully",
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
