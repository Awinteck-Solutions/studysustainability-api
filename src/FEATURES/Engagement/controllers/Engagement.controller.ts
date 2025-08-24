import { Request, Response } from "express";
import mongoose from "mongoose";
import Engagement from "../schema/Engagement.schema";

export class EngagementController {
  // Track impression, view, or dwell time
  static async track(req: Request, res: Response) {
    try {
      const userId = req["currentUser"]?.id;
      const { item, itemType, type, value } = req.body;

      if ( !item || !itemType || !type) {
        return res.status(400).json({
          success: false,
          message: "item, itemType, and type are required",
        });
      }

      const filter = {
        // user: new mongoose.Types.ObjectId(userId),
        item: new mongoose.Types.ObjectId(item),
        itemType,
        type,
      };

      const meta = {
        ip:
          req.ip ||
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          "",
        userAgent: req.headers["user-agent"] || "",
        device: req.headers["device-type"] || "", // if your frontend passes device-type
        referrer:
          req.headers["referer"] || req.headers["referrer"] || "",
      };

      let update;
      if (type === "DWELL_TIME") {
        update = {
          $inc: { value: value || 0 },
          $set: { meta },
        };
      } else {
        update = {
          $inc: { value: 1 },
          $set: { meta },
        };
      }

      const engagement = await Engagement.findOneAndUpdate(
        filter,
        update,
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Engagement tracked successfully",
        response: engagement,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get all engagements for current user
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req["currentUser"]?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required",
        });
      }

      const engagements = await Engagement.find({
        user: new mongoose.Types.ObjectId(userId),
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Engagements fetched successfully",
        response: engagements,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get engagements for a specific item
  static async getByItem(req: Request, res: Response) {
    try {
      const userId = req["currentUser"]?.id;
      const { itemId } = req.params;

      if (!itemId) {
        return res.status(400).json({
          success: false,
          message: "userId and itemId are required",
        });
      }

      const engagements = await Engagement.find({
        // user: new mongoose.Types.ObjectId(userId),
        item: new mongoose.Types.ObjectId(itemId),
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Engagements fetched successfully",
        response: engagements,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }


   static async analyticsForItem(req: Request, res: Response) {
     try {
       const { itemId } = req.params;
       if (!itemId) {
         return res.status(400).json({
           success: false,
           message: "itemId is required",
         });
       }

       const objectItemId = new mongoose.Types.ObjectId(itemId);

       const aggregation = await Engagement.aggregate([
         {
           $match: {
             item: objectItemId,
           },
         },
         {
           $group: {
             _id: "$type",
             total: { $sum: "$value" },
           },
         },
       ]);

       let totalImpressions = 0;
       let totalViews = 0;
       let totalDwellTime = 0;

       aggregation.forEach((item) => {
         if (item._id === "IMPRESSION") totalImpressions = item.total;
         if (item._id === "VIEW") totalViews = item.total;
         if (item._id === "DWELL_TIME") totalDwellTime = item.total;
       });

       const ctr =
         totalImpressions > 0
           ? Math.round((totalViews / totalImpressions) * 1000) / 10 // percentage with 1 decimal
           : 0;

       // Prepare data for graph (daily)
       const graphData = await Engagement.aggregate([
         {
           $match: {
             item: objectItemId,
           },
         },
         {
           $project: {
             type: 1,
             value: 1,
             day: {
               $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
             },
           },
         },
         {
           $group: {
             _id: { day: "$day", type: "$type" },
             total: { $sum: "$value" },
           },
         },
         {
           $group: {
             _id: "$_id.day",
             impressions: {
               $sum: {
                 $cond: [{ $eq: ["$_id.type", "IMPRESSION"] }, "$total", 0],
               },
             },
             views: {
               $sum: {
                 $cond: [{ $eq: ["$_id.type", "VIEW"] }, "$total", 0],
               },
             },
             dwellTime: {
               $sum: {
                 $cond: [{ $eq: ["$_id.type", "DWELL_TIME"] }, "$total", 0],
               },
             },
           },
         },
         { $sort: { _id: 1 } },
       ]);

       const formattedGraphData = graphData.map((entry) => {
         const dayCtr =
           entry.impressions > 0
             ? Math.round((entry.views / entry.impressions) * 1000) / 10 // %
             : 0;
        
         return {
           date: entry._id,
           impressions: entry.impressions,
           views: entry.views,
           dwellTime: entry.dwellTime,
             ctr: dayCtr,
         }
       });

      return res.status(200).json({
        success: true,
        message: "Analytics fetched successfully",
        response: {
          itemId,
          totalImpressions,
          totalViews,
          totalDwellTime,
          ctr, // %
          graph: formattedGraphData, // [{date, impressions, views, dwellTime}]
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
   }
  
}
