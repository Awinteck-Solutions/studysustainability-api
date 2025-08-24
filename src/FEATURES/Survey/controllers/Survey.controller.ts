// controllers/survey.controller.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import Survey from "../schema/Survey.schema";

export class SurveyController {
  // Create
  static async create(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const data = req.body;

      const survey = await Survey.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      return res.status(201).json({
        success: true,
        message: "Survey created successfully",
        response: survey,
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

      const survey = await Survey.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: data },
        { new: true }
      );

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Survey updated successfully",
        response: survey,
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

      const survey = await Survey.findOneAndUpdate(
        { _id: id, user: userId },
        { status: "DELETED" },
        { new: true }
      );

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Survey deleted successfully",
        response: survey,
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
      const surveys = await Survey.find({
        user: userId,
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Surveys fetched successfully",
        response: surveys,
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

      const survey = await Survey.findOne({
        _id: id,
        user: userId,
      });

      if (!survey) {
        return res.status(404).json({
          success: false,
          message: "Survey not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Survey fetched successfully",
        response: survey,
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
