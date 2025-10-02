import { Request, Response } from "express";
import AdvertiseModel from "../schema/advertise.schema";
import * as multer from "multer";
import { Roles } from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
import redis from "../../../util/redis";
import { CreateAdvertiseDto, UpdateAdvertiseDto } from "../dto/advertise.dto";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}

// Helper function to invalidate public cache patterns
const invalidatePublicCache = async () => {
  try {
    // Get all keys that match the public cache pattern
    const keys = await redis.keys('advertise_public_*');
    if (keys.length > 0) {
      // Delete keys one by one to avoid type issues
      for (const key of keys) {
        await redis.del(key);
      }
    }
  } catch (error) {
    console.error('Error invalidating public cache:', error);
  }
};

export class AdvertiseController {
  // Create new advertisement
  static async create(req: MulterRequest, res: Response) {
    try {
      const { id } = req["currentUser"];
      
      const {
        title,
        description,
        category,
        advertType,
        placement,
        targetAudience,
        startDate,
        endDate,
        isActive,
        externalLink,
        metadata,
      } = req.body;

      let model: any = {
        author: id,
        title,
        description,
        category,
        advertType: advertType || 'landscape',
        placement: placement || 'homepage',
        targetAudience,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : true,
        externalLink,
        metadata: metadata ? JSON.parse(metadata) : undefined,
      };

      // Handle file uploads
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        
        for (const file of files) {
          if (file.fieldname === 'displayImage') {
            const result = await uploadFile(file, "advertise/images");
            if (result) {
              model.displayImage = result.Key;
            }
          } else if (file.fieldname === 'pdfFile') {
            const result = await uploadFile(file, "advertise/pdfs");
            if (result) {
              model.pdfFile = result.Key;
            }
          }
        }
      }
      const newModel = new AdvertiseModel(model);
      await newModel.save();

      // Invalidate cache after creating new advertisement
      await invalidateCache('ADVERTISE');
      await invalidatePublicCache();

      res.status(201).json({
        message: "Advertisement created successfully",
        response: newModel,
      });
    } catch (error) {
      console.log("error :>> ", error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update advertisement
  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        title,
        description,
        category,
        advertType,
        placement,
        targetAudience,
        startDate,
        endDate,
        isActive,
        externalLink,
        metadata,
      } = req.body;

      // Find the existing document by ID
      const existingModel = await AdvertiseModel.findById(req.params.id);

      if (!existingModel) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Update the model with new data
      existingModel.title = title || existingModel.title;
      existingModel.description = description || existingModel.description;
      existingModel.category = category || existingModel.category;
      existingModel.advertType = advertType || existingModel.advertType;
      existingModel.placement = placement || existingModel.placement;
      existingModel.targetAudience = targetAudience || existingModel.targetAudience;
      existingModel.startDate = startDate ? new Date(startDate) : existingModel.startDate;
      existingModel.endDate = endDate ? new Date(endDate) : existingModel.endDate;
      existingModel.isActive = isActive !== undefined ? isActive === 'true' : existingModel.isActive;
      existingModel.externalLink = externalLink || existingModel.externalLink;
      existingModel.metadata = metadata ? JSON.parse(metadata) : existingModel.metadata;

      // Handle file uploads
      if (req.files) {
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        
        for (const file of files) {
          if (file.fieldname === 'displayImage') {
            const result = await uploadFile(file, "advertise/images");
            if (result) {
              existingModel.displayImage = result.Key;
            }
          } else if (file.fieldname === 'pdfFile') {
            const result = await uploadFile(file, "advertise/pdfs");
            if (result) {
              existingModel.pdfFile = result.Key;
            }
          }
        }
      }

      // Save the updated model
      const updatedModel = await existingModel.save();

      // Invalidate cache after updating advertisement
      await invalidateCache('ADVERTISE', req.params.id);
      await invalidatePublicCache();

      res.status(200).json({
        message: "Advertisement updated successfully",
        response: updatedModel,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update only image
  static async updateImage(req: MulterRequest, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findById(req.params.id);

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      if (req.file && req.file.fieldname === 'displayImage') {
        const result = await uploadFile(req.file, "advertise/images");
        if (result) {
          advertisement.displayImage = result.Key;
        }
        const response = await advertisement.save();

        // Invalidate cache after updating image
        await invalidateCache('ADVERTISE', req.params.id);
        await invalidatePublicCache();

        res.status(201).json({
          message: "Advertisement image updated successfully",
          response,
        });
      } else {
        return res.status(400).json({ error: "No image uploaded" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update only PDF
  static async updatePdf(req: MulterRequest, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findById(req.params.id);

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      if (req.file && req.file.fieldname === 'pdfFile') {
        const result = await uploadFile(req.file, "advertise/pdfs");
        if (result) {
          advertisement.pdfFile = result.Key;
        }
        const response = await advertisement.save();

        // Invalidate cache after updating PDF
        await invalidateCache('ADVERTISE', req.params.id);
        await invalidatePublicCache();

        res.status(201).json({
          message: "Advertisement PDF updated successfully",
          response,
        });
      } else {
        return res.status(400).json({ error: "No PDF uploaded" });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get single advertisement
  static async getOne(req: Request, res: Response) {
    try {
      const key = CACHE_KEYS.ADVERTISE.BY_ID(req.params.id);
      
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({ message: "Data found", response: cachedData });
      }

      const model = await AdvertiseModel.findById(req.params.id);

      if (!model) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Cache the result for 1 hour
      await setCachedData(key, model, CACHE_DURATION.MEDIUM);
      res.status(200).json({ message: "Advertisement found", response: model });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all advertisements (admin/user specific)
  static async getAll(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = CACHE_KEYS.ADVERTISE.ALL;
        
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({ message: "Data found", response: cachedData });
        }

        const models = await AdvertiseModel.find({
          status: { $ne: "DELETED" },
        }).sort({ createdAt: -1 });

        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({ message: "Advertisements found", response: models });
      } else {
        const key = getUserCacheKey(CACHE_KEYS.ADVERTISE.ALL, id);
        
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({ message: "Data found", response: cachedData });
        }

        const models = await AdvertiseModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: { $ne: "DELETED" },
        }).sort({ createdAt: -1 });

        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({ message: "Advertisements found", response: models });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all public advertisements (for website display)
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const category = req.query.category as string;
      const advertType = req.query.advertType as string;
      const placement = req.query.placement as string;
      const targetAudience = req.query.targetAudience as string;
      const isActive = req.query.isActive as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }

      if (advertType) {
        query.advertType = advertType;
      }

      if (placement) {
        query.placement = placement;
      }

      if (targetAudience) {
        query.targetAudience = { $regex: targetAudience, $options: 'i' };
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      // Filter out expired advertisements unless explicitly requested
      if (includeExpired !== 'true') {
        query.$and = [
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: null },
              { endDate: { $gte: new Date() } }
            ]
          }
        ];
      }

      // Create cache key that includes search and filter parameters
      const cacheKey = `advertise_public_${page}_${limit}_${search || ''}_${category || ''}_${advertType || ''}_${placement || ''}_${targetAudience || ''}_${isActive || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        AdvertiseModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AdvertiseModel.countDocuments(query)
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
            category: category || null,
            advertType: advertType || null,
            placement: placement || null,
            targetAudience: targetAudience || null,
            isActive: isActive || null,
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

  // Track view of advertisement
  static async trackView(req: Request, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findById(req.params.id);

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Increment view count
      advertisement.viewCount = (advertisement.viewCount || 0) + 1;
      await advertisement.save();

      // Invalidate cache for this specific advertisement
      // await invalidateCache('ADVERTISE ', req.params.id);
      // Invalidate public cache as view count changes
      // await invalidatePublicCache();

      res.status(200).json({
        message: "View tracked successfully",
        response: {
          viewCount: advertisement.viewCount,
          clickCount: advertisement.clickCount || 0
        }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Track click on advertisement
  static async trackClick(req: Request, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findById(req.params.id);

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Increment click count
      advertisement.clickCount = (advertisement.clickCount || 0) + 1;
      await advertisement.save();

      // Invalidate cache for this specific advertisement
      // await invalidateCache('ADVERTISE', req.params.id);
      // // Invalidate public cache as click count changes
      // await invalidatePublicCache();

      // Return the file URL or external link
      const response = {
        pdfFile: advertisement.pdfFile,
        externalLink: advertisement.externalLink,
        viewCount: advertisement.viewCount || 0,
        clickCount: advertisement.clickCount
      };

      res.status(200).json({
        message: "Click tracked successfully",
        response
      });
    } catch (error) {
      console.error('Error tracking click:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Soft delete advertisement
  static async delete(req: Request, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findByIdAndUpdate(
        req.params.id,
        { status: "DELETED" },
        { new: true }
      );

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Invalidate cache after soft deletion
      await invalidateCache('ADVERTISE', req.params.id);
      await invalidatePublicCache();

      res.status(200).json({
        message: "Advertisement status updated to DELETED",
        advertisement
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Permanent delete advertisement
  static async permanentDelete(req: Request, res: Response) {
    try {
      const advertisement = await AdvertiseModel.findByIdAndDelete(req.params.id);

      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }

      // Invalidate cache after permanent deletion
      await invalidateCache('ADVERTISE', req.params.id);
      await invalidatePublicCache();
      
      res.status(200).json({ message: "Advertisement successfully deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
