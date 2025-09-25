import { Request, Response } from "express";
import AdvertiseWithUsModel from "../schema/advertiseWithUs.schema";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData } from "../../../util/redis-helper";

export class AdvertiseWithUsController {
  static async create(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, phone, targetAudience, advertPurpose, message } = req.body;

      const newAdvertiseWithUs = new AdvertiseWithUsModel({
        firstname,
        lastname,
        email,
        phone,
        targetAudience,
        advertPurpose,
        message,
      });

      const savedModel = await newAdvertiseWithUs.save();

      // Invalidate cache
      await invalidateCache('ADVERTISE_WITH_US');

      res.status(201).json({
        status: true,
        message: "Advertise with us request created successfully",
        response: savedModel,
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract filter parameters
      const readState = req.query.readState as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      // Build the base query - default to ACTIVE status only
      let query: any = { status: "ACTIVE" };

      // Add search functionality
      if (search) {
        query.$or = [
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { targetAudience: { $regex: search, $options: 'i' } },
          { advertPurpose: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (readState !== undefined) {
        query.readState = readState === 'true';
      }

      // Allow status override if explicitly provided
      if (status) {
        query.status = status;
      }

      // Create cache key
      const cacheKey = `advertise_with_us_${page}_${limit}_${readState || ''}_${status || ''}_${search || ''}`;

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        AdvertiseWithUsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        AdvertiseWithUsModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      const responsePayload = {
        status: true,
        message: "Data found",
        metadata: {
          total,
          page,
          limit,
          totalPages,
          filters: {
            readState: readState || null,
            status: status || "ACTIVE", // Show default status
            search: search || null,
          }
        },
        response: models,
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      res.status(200).json(responsePayload);

    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Create cache key
      const cacheKey = CACHE_KEYS.ADVERTISE_WITH_US?.BY_ID(id);

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const model = await AdvertiseWithUsModel.findById(id);

      if (!model) {
        return res.status(404).json({ error: "Advertise with us request not found" });
      }

      const responsePayload = {
        status: true,
        message: "Data found",
        response: model,
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      res.status(200).json(responsePayload);

    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstname, lastname, email, phone, targetAudience, advertPurpose, message, readState, status } = req.body;

      const existingModel = await AdvertiseWithUsModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Advertise with us request not found" });
      }

      // Update fields
      existingModel.firstname = firstname || existingModel.firstname;
      existingModel.lastname = lastname || existingModel.lastname;
      existingModel.email = email || existingModel.email;
      existingModel.phone = phone || existingModel.phone;
      existingModel.targetAudience = targetAudience || existingModel.targetAudience;
      existingModel.advertPurpose = advertPurpose || existingModel.advertPurpose;
      existingModel.message = message || existingModel.message;
      
      // Handle readState update
      if (readState !== undefined) {
        existingModel.readState = readState;
      }
      
      // Handle status update
      if (status) {
        existingModel.status = status;
      }

      const updatedModel = await existingModel.save();

      // Invalidate cache
      await invalidateCache('ADVERTISE_WITH_US', id);
      await invalidateCache('ADVERTISE_WITH_US');

      res.status(200).json({
        status: true,
        message: "Advertise with us request updated successfully",
        response: updatedModel,
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingModel = await AdvertiseWithUsModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Advertise with us request not found" });
      }

      // Soft delete - update status to DELETED
      existingModel.status = "DELETED";
      await existingModel.save();

      // Invalidate cache
      await invalidateCache('ADVERTISE_WITH_US', id);

      res.status(200).json({
        status: true,
        message: "Advertise with us request deleted successfully",
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingModel = await AdvertiseWithUsModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Advertise with us request not found" });
      }

      // Permanent delete
      await AdvertiseWithUsModel.findByIdAndDelete(id);

      // Invalidate cache
      await invalidateCache('ADVERTISE_WITH_US', id);

      res.status(200).json({
        status: true,
        message: "Advertise with us request permanently deleted successfully",
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Public endpoint for submitting advertise with us requests
  static async submitRequest(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, phone, targetAudience, advertPurpose, message } = req.body;

      const newAdvertiseWithUs = new AdvertiseWithUsModel({
        firstname,
        lastname,
        email,
        phone,
        targetAudience,
        advertPurpose,
        message,
      });

      const savedModel = await newAdvertiseWithUs.save();

      // Invalidate cache
      await invalidateCache('ADVERTISE_WITH_US');

      res.status(201).json({
        status: true,
          message: "Your advertise with us request has been submitted successfully. We will get back to you soon!",
        response: {
          id: savedModel._id,
          resourceId: savedModel.resourceId,
          submittedAt: savedModel.createdAt
        },
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get comprehensive advertise with us statistics
  static async getStats(req: Request, res: Response) {
    try {
      const cacheKey = 'advertise_with_us_stats';

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [
        totalRequests,
        totalRead,
        totalUnread,
        activeRequests,
        deletedRequests,
        targetAudienceStats,
        advertPurposeStats,
        recentRequests,
        monthlyStats
      ] = await Promise.all([
        // Total requests
        AdvertiseWithUsModel.countDocuments({}),
        
        // Total read requests
        AdvertiseWithUsModel.countDocuments({ readState: true, status: { $ne: "DELETED" } }),
        
        // Total unread requests
        AdvertiseWithUsModel.countDocuments({ readState: false, status: { $ne: "DELETED" } }),
        
        // Active requests
        AdvertiseWithUsModel.countDocuments({ status: "ACTIVE" }),
        
        // Deleted requests
        AdvertiseWithUsModel.countDocuments({ status: "DELETED" }),
        
        // Target audience breakdown
        AdvertiseWithUsModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$targetAudience", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Advert purpose breakdown
        AdvertiseWithUsModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$advertPurpose", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Recent requests (last 7 days)
        AdvertiseWithUsModel.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        }),
        
        // Monthly statistics (last 6 months)
        AdvertiseWithUsModel.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) },
              status: { $ne: "DELETED" }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } }
        ])
      ]);

      const stats = {
        overview: {
          totalRequests,
          activeRequests,
          deletedRequests,
          recentRequests
        },
        readStatus: {
          totalRead,
          totalUnread,
          readPercentage: totalRequests > 0 ? Math.round((totalRead / totalRequests) * 100) : 0,
          unreadPercentage: totalRequests > 0 ? Math.round((totalUnread / totalRequests) * 100) : 0
        },
        targetAudienceBreakdown: targetAudienceStats,
        advertPurposeBreakdown: advertPurposeStats,
        monthlyTrends: monthlyStats,
        summary: {
          totalActiveRequests: activeRequests,
          totalUnreadRequests: totalUnread,
          mostCommonTargetAudience: targetAudienceStats.length > 0 ? targetAudienceStats[0]._id : 'N/A',
          mostCommonAdvertPurpose: advertPurposeStats.length > 0 ? advertPurposeStats[0]._id : 'N/A',
          recentActivity: recentRequests,
          averageRequestsPerMonth: monthlyStats.length > 0 ? 
            Math.round((monthlyStats.reduce((sum, month) => sum + month.count, 0) / monthlyStats.length) * 10) / 10 : 0
        }
      };

      const responsePayload = {
        status: true,
        message: "Advertise with us statistics retrieved successfully",
        response: stats,
      };

      // Cache the result for 15 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.SHORT);
      res.status(200).json(responsePayload);

    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }
}
