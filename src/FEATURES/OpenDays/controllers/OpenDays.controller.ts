import { Request, Response } from "express";
import mongoose from "mongoose";
import * as multer from "multer";
import OpenDays from "../schema/OpenDays.schema";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}
export class OpenDaysController {
  // Create
  static async create(req: MulterRequest, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const data = req.body;

      if (req.file) {
        data.image = `${req.file.fieldname}/${req.file.filename}`;
      }

      const openDay = await OpenDays.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      return res.status(201).json({
        success: true,
        message: "Open Day created successfully",
        response: openDay,
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

      const openDay = await OpenDays.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: data },
        { new: true }
      );

      if (!openDay) {
        return res.status(404).json({
          success: false,
          message: "Open Day not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Open Day updated successfully",
        response: openDay,
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

      const openDay = await OpenDays.findOneAndUpdate(
        { _id: id, user: userId },
        { status: "DELETED" },
        { new: true }
      );

      if (!openDay) {
        return res.status(404).json({
          success: false,
          message: "Open Day not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Open Day deleted successfully",
        response: openDay,
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
      const openDays = await OpenDays.find({
        user: userId,
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Open Days fetched successfully",
        response: openDays,
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

      const openDay = await OpenDays.findOne({
        _id: id,
        user: userId,
      });

      if (!openDay) {
        return res.status(404).json({
          success: false,
          message: "Open Day not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Open Day fetched successfully",
        response: openDay,
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
