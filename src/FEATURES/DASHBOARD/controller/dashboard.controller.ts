import { Request, Response } from "express";
import DashboardAnalyticsModel from "../schema/dashboard.schema";
import { getCachedData, setCachedData, invalidateCache, CACHE_DURATION, CACHE_KEYS } from "../../../util/redis-helper";
import { Roles } from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { 
  OverallStatsDto, 
  UserRegistrationDataDto, 
  DashboardQueryDto,
  ErrorResponseDto,
  CacheInfoDto
} from "../dto/dashboard.dto";

// Import models for data aggregation
import AdminModel from "../../AUTH/schema/admin.schema";
import AdvertiseModel from "../../ADVERTISE/schema/advertise.schema";
import AdvertiseWithUsModel from "../../ADVERTISE_WITH_US/schema/advertiseWithUs.schema";
import WebsiteFeedbackModel from "../../WEBSITE_FEEDBACK/schema/websiteFeedback.schema";
import EmailerModel from "../../EMAILER/schema/emailer.schema";
import EmailCampaign from "../../EmailCampaign/schema/EmailCampaign.schema";

export class DashboardController {
  // Helper function to get date range based on period
  private static getDateRange(period: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (period === "custom" && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case "7d":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    return { start, end };
  }

  // Helper function to generate date array for chart data
  private static generateDateArray(start: Date, end: Date): string[] {
    const dates: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  // 1. Dashboard Statistics Endpoint
  static async getStatistics(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      // Check if user has admin privileges
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const cacheKey = "dashboard_statistics";
      const cachedData = await getCachedData(cacheKey);
      
      if (cachedData) {
        return res.json({
          ...cachedData,
          cacheInfo: {
            lastUpdated: cachedData.lastUpdated,
            isCached: true
          }
        });
      }

      // Calculate overall statistics
      const [
        totalUsers,
        adsCampaigns,
        adsRequests,
        websiteFeedbacks,
        pdfDownloads,
        emailCampaigns,
        emailRequests
      ] = await Promise.all([
        // Total users (all user types)
        // exclude admin and user
        AdminModel.countDocuments({ status: { $ne: "DELETED" }, role: { $nin: [Roles.ADMIN, Roles.USER] } }),
        
        // Active ads campaigns
        AdvertiseModel.countDocuments({ status: "ACTIVE" }),
        
        // Pending ads requests
        AdvertiseWithUsModel.countDocuments({ status: "ACTIVE", readState: false }),
        
        // Total website feedbacks
        WebsiteFeedbackModel.countDocuments({ status: { $ne: "DELETED" } }),
        
        // PDF downloads (mock calculation - you can implement actual tracking)
        // where id is 68cb11c5209cf2ac9d4b6983, return the click count
        AdvertiseModel.findOne({ _id: new mongoose.Types.ObjectId("68cb11c5209cf2ac9d4b6983") }).select("clickCount").lean(),
        
        // Sent email campaigns
        EmailerModel.countDocuments({ status: "SENT" }),
        
        // Pending email requests (mock - you can implement actual tracking)
        EmailCampaign.countDocuments({ status: "PENDING" })
      ]);

      const overallStats: OverallStatsDto = {
        totalUsers,
        adsCampaigns,
        adsRequests,
        websiteFeedbacks,
        pdfDownloads: pdfDownloads?.clickCount || 0,
        emailCampaigns,
        emailRequests
      };

      const response = {
        status: "success",
        message: "Dashboard statistics retrieved successfully",
        response: overallStats,
        lastUpdated: new Date()
      };

      // Cache for 5 minutes
      await setCachedData(cacheKey, response, 300);
      
      res.json({
        ...response,
        cacheInfo: {
          lastUpdated: response.lastUpdated,
          isCached: false
        }
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR",
        details: error.message
      });
    }
  }

  // 2. User Registrations Analytics Endpoint
  static async getUserRegistrations(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      
      // Validate period
      if (!["7d", "30d", "90d", "1y", "custom"].includes(period)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid time period provided",
          error_code: "INVALID_PERIOD",
          details: "Period must be one of: 7d, 30d, 90d, 1y, custom"
        });
      }

      if (period === "custom" && (!startDate || !endDate)) {
        return res.status(400).json({
          status: "error",
          message: "Start date and end date are required for custom period",
          error_code: "MISSING_DATES"
        });
      }

      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_user_registrations_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json({
          ...cachedData,
          cacheInfo: {
            lastUpdated: cachedData.lastUpdated,
            isCached: true
          }
        });
      }

      // Aggregate user registrations by date and role
      const userRegistrations = await AdminModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              role: "$role"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            registrations: {
              $push: {
                role: "$_id.role",
                count: "$count"
              }
            }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]);

      // Generate complete date array and fill missing dates
      const dateArray = this.generateDateArray(start, end);
      const result: UserRegistrationDataDto[] = dateArray.map(date => {
        const dayData = userRegistrations.find(item => item._id === date);
        
        if (dayData) {
          const students = dayData.registrations.find(r => r.role === Roles.STUDENT)?.count || 0;
          const universities = dayData.registrations.find(r => r.role === Roles.UNIVERSITY)?.count || 0;
          const providers = dayData.registrations.find(r => r.role === Roles.PROFESSIONALS)?.count || 0;
          const eventOrganisers = dayData.registrations.find(r => r.role === Roles.EVENT_ORGANIZER)?.count || 0;
          
          return {
            date,
            students,
            universities,
            providers,
            eventOrganisers,
            total: students + universities + providers + eventOrganisers
          };
        }
        
        return {
          date,
          students: 0,
          universities: 0,
          providers: 0,
          eventOrganisers: 0,
          total: 0
        };
      });

      const response = {
        status: "success",
        message: "User registration data retrieved successfully",
        response: result,
        lastUpdated: new Date()
      };

      // Cache for 10 minutes
      await setCachedData(cacheKey, response, 600);
      
      res.json({
        ...response,
        cacheInfo: {
          lastUpdated: response.lastUpdated,
          isCached: false
        }
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR",
        details: error.message
      });
    }
  }

  // 3. Individual Metric Endpoints
  static async getAdsCampaigns(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_ads_campaigns_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const adsData = await AdvertiseModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
            paused: { $sum: { $cond: [{ $eq: ["$status", "INACTIVE"] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = adsData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          active: dayData?.active || 0,
          paused: dayData?.paused || 0,
          completed: dayData?.completed || 0
        };
      });

      const response = {
        status: "success",
        message: "Ads campaigns data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  static async getAdsRequests(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_ads_requests_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const requestsData = await AdvertiseWithUsModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$readState", false] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $and: [{ $eq: ["$readState", true] }, { $eq: ["$status", "ACTIVE"] }] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = requestsData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          pending: dayData?.pending || 0,
          approved: dayData?.approved || 0,
          rejected: dayData?.rejected || 0
        };
      });

      const response = {
        status: "success",
        message: "Ads requests data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  static async getWebsiteFeedbacks(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_website_feedbacks_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const feedbacksData = await WebsiteFeedbackModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            averageRating: { $avg: "$easeOfUse" },
            positive: { $sum: { $cond: [{ $gte: ["$easeOfUse", 4] }, 1, 0] } },
            negative: { $sum: { $cond: [{ $lte: ["$easeOfUse", 2] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = feedbacksData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          averageRating: Math.round((dayData?.averageRating || 0) * 10) / 10,
          positive: dayData?.positive || 0,
          negative: dayData?.negative || 0
        };
      });

      const response = {
        status: "success",
        message: "Website feedbacks data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  static async getPdfDownloads(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_pdf_downloads_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Mock PDF downloads data - you can implement actual tracking
      const downloadsData = await AdvertiseModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" },
            pdfFile: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            uniqueDownloads: { $sum: 1 },
            totalDownloads: { $sum: { $add: ["$viewCount", "$clickCount"] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = downloadsData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          uniqueDownloads: dayData?.uniqueDownloads || 0,
          totalDownloads: dayData?.totalDownloads || 0
        };
      });

      const response = {
        status: "success",
        message: "PDF downloads data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  static async getEmailCampaigns(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_email_campaigns_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const campaignsData = await EmailerModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
            scheduled: { $sum: { $cond: [{ $eq: ["$status", "SCHEDULED"] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = campaignsData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          sent: dayData?.sent || 0,
          scheduled: dayData?.scheduled || 0,
          draft: dayData?.draft || 0
        };
      });

      const response = {
        status: "success",
        message: "Email campaigns data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  static async getEmailRequests(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      const { period = "30d", startDate, endDate }: DashboardQueryDto = req.query;
      const { start, end } = this.getDateRange(period, startDate, endDate);
      const cacheKey = `dashboard_email_requests_${period}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Mock email requests data - you can implement actual tracking
      const requestsData = await EmailerModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: "DELETED" }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ["$status", "DRAFT"] }, 1, 0] } },
            processed: { $sum: { $cond: [{ $in: ["$status", ["SENT", "SCHEDULED"]] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const dateArray = this.generateDateArray(start, end);
      const result = dateArray.map(date => {
        const dayData = requestsData.find(item => item._id === date);
        return {
          date,
          count: dayData?.count || 0,
          pending: dayData?.pending || 0,
          processed: dayData?.processed || 0
        };
      });

      const response = {
        status: "success",
        message: "Email requests data retrieved successfully",
        response: result
      };

      await setCachedData(cacheKey, response, 600);
      res.json(response);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }

  // Clear dashboard cache
  static async clearCache(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: "error",
          message: "Access denied. Admin privileges required.",
          error_code: "ACCESS_DENIED"
        });
      }

      // Clear all dashboard-related cache keys
      const cacheKeys = [
        "dashboard_statistics",
        "dashboard_user_registrations_*",
        "dashboard_ads_campaigns_*",
        "dashboard_ads_requests_*",
        "dashboard_website_feedbacks_*",
        "dashboard_pdf_downloads_*",
        "dashboard_email_campaigns_*",
        "dashboard_email_requests_*"
      ];

      // Note: In a real implementation, you'd need to implement pattern-based cache clearing
      // For now, we'll just clear the main statistics cache
      await invalidateCache('DASHBOARD');

      res.json({
        status: "success",
        message: "Dashboard cache cleared successfully"
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        error_code: "INTERNAL_ERROR"
      });
    }
  }
}
