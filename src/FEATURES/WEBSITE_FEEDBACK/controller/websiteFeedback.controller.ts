import { Request, Response } from "express";
import WebsiteFeedbackModel from "../schema/websiteFeedback.schema";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData } from "../../../util/redis-helper";

export class WebsiteFeedbackController {
  static async create(req: Request, res: Response) {
    try {
      const { 
        category, 
        pageURL, 
        yourFeedback, 
        fullname, 
        email, 
        easeOfUse, 
        design,  
        contactByEmail,
        informationAccuracy, 
        additionComments 
      } = req.body;

      const newWebsiteFeedback = new WebsiteFeedbackModel({
        category,
        pageURL,
        yourFeedback,
        fullname,
        email,
        easeOfUse,
        contactByEmail,
        design,
        informationAccuracy,
        additionComments,
      });

      const savedModel = await newWebsiteFeedback.save();

      // Invalidate cache
      await invalidateCache('WEBSITE_FEEDBACK');

      res.status(201).json({
        status: true,
        message: "Website feedback created successfully",
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
      const category = req.query.category as string;
      const minRating = req.query.minRating as string;

      // Build the base query - default to ACTIVE status only
      let query: any = { status: "ACTIVE" };

      // Add search functionality
      if (search) {
        query.$or = [
          { fullname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { pageURL: { $regex: search, $options: 'i' } },
          { yourFeedback: { $regex: search, $options: 'i' } },
          { additionComments: { $regex: search, $options: 'i' } },
          { contactByEmail: { $regex: search, $options: 'i' } },  
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

      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }

      if (minRating) {
        const rating = parseInt(minRating);
        query.$or = [
          { easeOfUse: { $gte: rating } },
          { design: { $gte: rating } },
          { informationAccuracy: { $gte: rating } },
          { contactByEmail: { $gte: rating } }
        ];
      }

      // Create cache key
      const cacheKey = `website_feedback_${page}_${limit}_${readState || ''}_${status || ''}_${search || ''}_${category || ''}_${minRating || ''}`;

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        WebsiteFeedbackModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        WebsiteFeedbackModel.countDocuments(query)
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
            category: category || null,
            minRating: minRating || null,
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
      const cacheKey = CACHE_KEYS.WEBSITE_FEEDBACK?.BY_ID(id);

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const model = await WebsiteFeedbackModel.findById(id);

      if (!model) {
        return res.status(404).json({ error: "Website feedback not found" });
      }

      const responsePayload = {
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
      const { 
        category, 
        pageURL, 
        yourFeedback, 
        fullname, 
        email, 
        easeOfUse, 
        design, 
        contactByEmail,
        informationAccuracy, 
        additionComments, 
        readState, 
        status 
      } = req.body;

      const existingModel = await WebsiteFeedbackModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Website feedback not found" });
      }

      // Update fields
      existingModel.category = category || existingModel.category;
      existingModel.pageURL = pageURL || existingModel.pageURL;
      existingModel.yourFeedback = yourFeedback || existingModel.yourFeedback;
      existingModel.fullname = fullname || existingModel.fullname;
      existingModel.email = email || existingModel.email;
      existingModel.easeOfUse = easeOfUse || existingModel.easeOfUse;
      existingModel.design = design || existingModel.design;
      existingModel.contactByEmail = contactByEmail !== undefined ? contactByEmail : existingModel.contactByEmail;
      existingModel.informationAccuracy = informationAccuracy || existingModel.informationAccuracy;
      existingModel.additionComments = additionComments || existingModel.additionComments;
      
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
      await invalidateCache('WEBSITE_FEEDBACK', id);
      await invalidateCache('WEBSITE_FEEDBACK');

      res.status(200).json({
        status: true,
        message: "Website feedback updated successfully",
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

      const existingModel = await WebsiteFeedbackModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Website feedback not found" });
      }

      // Soft delete - update status to DELETED
      existingModel.status = "DELETED";
      await existingModel.save();

      // Invalidate cache
      await invalidateCache('WEBSITE_FEEDBACK', id);

      res.status(200).json({
        status: true,
        message: "Website feedback deleted successfully",
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingModel = await WebsiteFeedbackModel.findById(id);

      if (!existingModel) {
        return res.status(404).json({ error: "Website feedback not found" });
      }

      // Permanent delete
      await WebsiteFeedbackModel.findByIdAndDelete(id);

      // Invalidate cache
      await invalidateCache('WEBSITE_FEEDBACK', id);

      res.status(200).json({
        status: true,
        message: "Website feedback permanently deleted successfully",
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Public endpoint for submitting website feedback
  static async submitFeedback(req: Request, res: Response) {
    try {
      const { 
        category, 
        pageURL, 
        yourFeedback, 
        fullname, 
        email, 
        easeOfUse, 
        contactByEmail, 
        design, 
        informationAccuracy, 
        additionComments 
      } = req.body;

      const newWebsiteFeedback = new WebsiteFeedbackModel({
        category,
        pageURL,
        yourFeedback,
        fullname,
        email,
        easeOfUse,
        contactByEmail,
        design,
        informationAccuracy,
        additionComments,
      });

      const savedModel = await newWebsiteFeedback.save();

      // Invalidate cache
      await invalidateCache('WEBSITE_FEEDBACK');

      res.status(201).json({
        status: true,
        message: "Thank you for your feedback! We appreciate your input and will use it to improve our website.",
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

  // Get feedback analytics/summary
  static async getAnalytics(req: Request, res: Response) {
    try {
      const cacheKey = 'website_feedback_analytics';

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [
        totalFeedback,
        unreadFeedback,
        averageEaseOfUse,
        averageDesign,
        averageInformationAccuracy,
        categoryBreakdown
      ] = await Promise.all([
        WebsiteFeedbackModel.countDocuments({ status: { $ne: "DELETED" } }),
        WebsiteFeedbackModel.countDocuments({ readState: false, status: { $ne: "DELETED" } }),
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: null, avg: { $avg: "$easeOfUse" } } }
        ]),
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: null, avg: { $avg: "$design" } } }
        ]),
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: null, avg: { $avg: "$informationAccuracy" } } }
        ]),
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      const analytics = {
        totalFeedback,
        unreadFeedback,
        averageRatings: {
          easeOfUse: averageEaseOfUse[0]?.avg ? Math.round(averageEaseOfUse[0].avg * 10) / 10 : 0,
          design: averageDesign[0]?.avg ? Math.round(averageDesign[0].avg * 10) / 10 : 0,
          informationAccuracy: averageInformationAccuracy[0]?.avg ? Math.round(averageInformationAccuracy[0].avg * 10) / 10 : 0,
        },
        categoryBreakdown,
        overallAverage: 0
      };

      // Calculate overall average
      const totalRating = analytics.averageRatings.easeOfUse + analytics.averageRatings.design + analytics.averageRatings.informationAccuracy;
      analytics.overallAverage = Math.round((totalRating / 3) * 10) / 10;

      const responsePayload = {
        status: true,
        message: "Website feedback analytics retrieved successfully",
        response: analytics,
      };

      // Cache the result for 30 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.SHORT);
      res.status(200).json(responsePayload);

    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get comprehensive feedback stats
  static async getStats(req: Request, res: Response) {
    try {
      const cacheKey = 'website_feedback_stats';

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [
        totalFeedbacks,
        totalRead,
        totalUnread,
        totalContactByEmail,
        totalNotContactByEmail,
        activeFeedbacks,
        deletedFeedbacks,
        categoryStats,
        ratingStats,
        recentFeedbacks
      ] = await Promise.all([
        // Total feedbacks
        WebsiteFeedbackModel.countDocuments({}),
        
        // Total read feedbacks
        WebsiteFeedbackModel.countDocuments({ readState: true, status: { $ne: "DELETED" } }),
        
        // Total unread feedbacks
        WebsiteFeedbackModel.countDocuments({ readState: false, status: { $ne: "DELETED" } }),
        
        // Total contact by email
        WebsiteFeedbackModel.countDocuments({ contactByEmail: true, status: { $ne: "DELETED" } }),
        
        // Total not contact by email
        WebsiteFeedbackModel.countDocuments({ contactByEmail: false, status: { $ne: "DELETED" } }),
        
        // Active feedbacks
        WebsiteFeedbackModel.countDocuments({ status: "ACTIVE" }),
        
        // Deleted feedbacks
        WebsiteFeedbackModel.countDocuments({ status: "DELETED" }),
        
        // Category breakdown
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Rating statistics
        WebsiteFeedbackModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          {
            $group: {
              _id: null,
              avgEaseOfUse: { $avg: "$easeOfUse" },
              avgDesign: { $avg: "$design" },
              avgInformationAccuracy: { $avg: "$informationAccuracy" },
              minEaseOfUse: { $min: "$easeOfUse" },
              maxEaseOfUse: { $max: "$easeOfUse" },
              minDesign: { $min: "$design" },
              maxDesign: { $max: "$design" },
              minInformationAccuracy: { $min: "$informationAccuracy" },
              maxInformationAccuracy: { $max: "$informationAccuracy" }
            }
          }
        ]),
        
        // Recent feedbacks (last 7 days)
        WebsiteFeedbackModel.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        })
      ]);

      // Process rating stats
      const ratingData = ratingStats[0] || {};
      const processedRatingStats = {
        easeOfUse: {
          average: ratingData.avgEaseOfUse ? Math.round(ratingData.avgEaseOfUse * 10) / 10 : 0,
          min: ratingData.minEaseOfUse || 0,
          max: ratingData.maxEaseOfUse || 0
        },
        design: {
          average: ratingData.avgDesign ? Math.round(ratingData.avgDesign * 10) / 10 : 0,
          min: ratingData.minDesign || 0,
          max: ratingData.maxDesign || 0
        },
        informationAccuracy: {
          average: ratingData.avgInformationAccuracy ? Math.round(ratingData.avgInformationAccuracy * 10) / 10 : 0,
          min: ratingData.minInformationAccuracy || 0,
          max: ratingData.maxInformationAccuracy || 0
        }
      };

      // Calculate overall average rating
      const overallAverage = (processedRatingStats.easeOfUse.average + 
                             processedRatingStats.design.average + 
                             processedRatingStats.informationAccuracy.average) / 3;

      const stats = {
        overview: {
          totalFeedbacks,
          activeFeedbacks,
          deletedFeedbacks,
          recentFeedbacks
        },
        readStatus: {
          totalRead,
          totalUnread,
          readPercentage: totalFeedbacks > 0 ? Math.round((totalRead / totalFeedbacks) * 100) : 0,
          unreadPercentage: totalFeedbacks > 0 ? Math.round((totalUnread / totalFeedbacks) * 100) : 0
        },
        contactPreferences: {
          totalContactByEmail,
          totalNotContactByEmail,
          contactByEmailPercentage: totalFeedbacks > 0 ? Math.round((totalContactByEmail / totalFeedbacks) * 100) : 0,
          notContactByEmailPercentage: totalFeedbacks > 0 ? Math.round((totalNotContactByEmail / totalFeedbacks) * 100) : 0
        },
        categoryBreakdown: categoryStats,
        ratingStatistics: {
          ...processedRatingStats,
          overallAverage: Math.round(overallAverage * 10) / 10
        },
        summary: {
          totalActiveFeedbacks: activeFeedbacks,
          totalUnreadFeedbacks: totalUnread,
          totalContactByEmail: totalContactByEmail,
          averageRating: Math.round(overallAverage * 10) / 10,
          mostCommonCategory: categoryStats.length > 0 ? categoryStats[0]._id : 'N/A',
          recentActivity: recentFeedbacks
        }
      };

      const responsePayload = {
        status: true,
        message: "Website feedback statistics retrieved successfully",
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
