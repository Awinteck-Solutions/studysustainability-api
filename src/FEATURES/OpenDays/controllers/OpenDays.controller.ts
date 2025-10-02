import { Request, Response } from "express";
import mongoose from "mongoose";
import * as multer from "multer";
import OpenDays from "../schema/OpenDays.schema";
import { uploadFile } from "../../../util/s3";
import { invalidateCache } from "../../../util/redis-helper";

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
        // data.image = `${req.file.fieldname}/${req.file.filename}`;
        const result = await uploadFile(req.file, "openDay");
        if (result) {
          data.image = `${result.Key}`;
        }
      }

      const openDay = await OpenDays.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      // Invalidate analytics cache
      await invalidateCache('ANALYTICS');

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
        // data.image = `${req.file.fieldname}/${req.file.filename}`;
        const result = await uploadFile(req.file, "openDay");
        if (result) {
          data.image = `${result.Key}`;
        }
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

      // Invalidate analytics cache
      await invalidateCache('ANALYTICS');

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
        { _id: id },
        { status: "DELETED" },
        { new: true }
      );

      if (!openDay) {
        return res.status(404).json({
          success: false,
          message: "Open Day not found",
        });
      }

      // Invalidate analytics cache
      await invalidateCache('ANALYTICS');

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [openDays, total] = await Promise.all([
        OpenDays.find({
          user: userId,
          status: { $ne: "DELETED" },
        }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        OpenDays.countDocuments({
          user: userId,
          status: { $ne: "DELETED" }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: "Open Days fetched successfully",
        metadata: {
          total,
          page,
          limit,
          totalPages,
          filters: {
            status: "ACTIVE,INACTIVE,REJECTED"
          }
        },
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

    // Get All -admin
    static async getAllAdmin(req: Request, res: Response) {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [openDays, total] = await Promise.all([
          OpenDays.find({
            status: { $ne: "DELETED" },
          }).sort({ createdAt: -1 }).skip(skip).limit(limit),
          OpenDays.countDocuments({ status: { $ne: "DELETED" } })
        ]);

        const totalPages = Math.ceil(total / limit);
  
        return res.status(200).json({
          success: true,
          message: "Open Days fetched successfully",
          metadata: {
            total,
            page,
            limit,
            totalPages,
            filters: {
              status: "ACTIVE,INACTIVE,REJECTED"
            }
          },
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

  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      const validStatuses = ["ACTIVE", "INACTIVE", "REJECTED", "DELETED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be one of: ACTIVE, INACTIVE, REJECTED, DELETED",
        });
      }

      const openDay = await OpenDays.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!openDay) {
        return res.status(404).json({
          success: false,
          message: "Open Day not found",
        });
      }

      // Invalidate analytics cache
      await invalidateCache('ANALYTICS');
      
      return res.status(200).json({
        success: true,
        message: "Open Day status updated successfully",
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
