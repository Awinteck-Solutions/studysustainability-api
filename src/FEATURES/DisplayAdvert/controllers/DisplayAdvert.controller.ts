// controllers/display-adverts.controller.ts

import {Request, Response} from "express";
import mongoose from "mongoose";
import * as multer from "multer";
import DisplayAdvert from "../schema/DisplayAdvert.schema";
import { uploadFile } from "../../../util/s3";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
}
export class DisplayAdvertsController {
  // Create advert
  static async create(req: MulterRequest, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const data = req.body;

      // If an image is uploaded, store its path
      if (req.file) {
        // data.image = `${req.file.fieldname}/${req.file.filename}`;
        // console.log("req.file.path :>> ", req.file.path);
        const result = await uploadFile(req.file, "displayAdvertisement");
        if (result) {
          data.image = `${result.Key}`;
        }
      }

      const advert = await DisplayAdvert.create({
        user: new mongoose.Types.ObjectId(userId),
        ...data,
      });

      return res.status(201).json({
        success: true,
        message: "Advert created successfully",
        response: advert,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Update advert
  static async update(req: MulterRequest, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const {id} = req.params;
      const data = req.body;
      // If an image is uploaded, store its path
      if (req.file) {
        // data.image = `${req.file.fieldname}/${req.file.filename}`;
        // console.log("req.file.path :>> ", req.file.path);
        const result = await uploadFile(req.file, "displayAdvertisement");
        if (result) {
          data.image = `${result.Key}`;
        }
      }

      const advert = await DisplayAdvert.findOneAndUpdate(
        {_id: id, user: userId},
        {$set: data},
        {new: true}
      );

      if (!advert) {
        return res.status(404).json({
          success: false,
          message: "Advert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Advert updated successfully",
        response: advert,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Soft delete advert
  static async delete(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const {id} = req.params;

      const advert = await DisplayAdvert.findOneAndUpdate(
        {_id: id, user: userId},
        {status: "DELETED"},
        {new: true}
      );

      if (!advert) {
        return res.status(404).json({
          success: false,
          message: "Advert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Advert deleted successfully",
        response: advert,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get all adverts for user
  static async getAll(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const adverts = await DisplayAdvert.find({user: userId, status: {$ne:'DELETED'}}).sort({
        createdAt: -1,
      });

      return res.status(200).json({
        success: true,
        message: "Adverts fetched successfully",
        response: adverts,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // Get single advert for user
  static async getOne(req: Request, res: Response) {
    try {
      const userId = req["currentUser"].id;
      const {id} = req.params;

      const advert = await DisplayAdvert.findOne({_id: id, user: userId});

      if (!advert) {
        return res.status(404).json({
          success: false,
          message: "Advert not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Advert fetched successfully",
        response: advert,
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
