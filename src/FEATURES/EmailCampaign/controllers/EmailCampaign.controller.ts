
import { Request, Response } from "express";
import mongoose from "mongoose";
import * as multer from "multer";
import EmailCampaign from "../schema/EmailCampaign.schema";


interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}
export class EmailCampaignController {
  // Create
  static async create(req: MulterRequest, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const data = req.body;

      if (req.file) {
        data.image = `${req.file.fieldname}/${req.file.filename}`;
      }

      const campaign = await EmailCampaign.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      return res.status(201).json({
        success: true,
        message: "Email campaign created successfully",
        response: campaign,
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
  static async update(req: MulterRequest, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const { id } = req.params;
      const data = req.body;

      if (req.file) {
        data.image = `${req.file.fieldname}/${req.file.filename}`;
      }

      const campaign = await EmailCampaign.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: data },
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email campaign updated successfully",
        response: campaign,
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

      const campaign = await EmailCampaign.findOneAndUpdate(
        { _id: id, user: userId },
        { status: "DELETED" },
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email campaign deleted successfully",
        response: campaign,
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
      const campaigns = await EmailCampaign.find({
        user: userId,
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Email campaigns fetched successfully",
        response: campaigns,
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

      const campaign = await EmailCampaign.findOne({ _id: id, user: userId });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Email campaign fetched successfully",
        response: campaign,
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
