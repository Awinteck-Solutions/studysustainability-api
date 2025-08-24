import { Request, Response } from "express";
import mongoose from "mongoose";
import MarketInsights from "../schema/MarketInsights.schema";

export class MarketInsightsController {
  // Create
  static async create(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const data = req.body;

      const insight = await MarketInsights.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      return res.status(201).json({
        success: true,
        message: "Market insight created successfully",
        response: insight,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Update
  static async update(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const { id } = req.params;
      const data = req.body;

      const insight = await MarketInsights.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: data },
        { new: true }
      );

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Market insight updated successfully",
        response: insight,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Soft Delete
  static async delete(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const { id } = req.params;

      const insight = await MarketInsights.findOneAndUpdate(
        { _id: id, user: userId },
        { status: "DELETED" },
        { new: true }
      );

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Market insight deleted successfully",
        response: insight,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get All
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const insights = await MarketInsights.find({
        user: userId,
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Market insights fetched successfully",
        response: insights,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get One
  static async getOne(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const { id } = req.params;

      const insight = await MarketInsights.findOne({
        _id: id,
        user: userId,
      });

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: "Market insight not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Market insight fetched successfully",
        response: insight,
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
