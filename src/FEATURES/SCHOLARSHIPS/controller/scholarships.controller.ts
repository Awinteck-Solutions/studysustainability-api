import {Request, Response} from "express";
import * as multer from "multer";
import ScholarshipsModel from "../schema/scholarships.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class ScholarshipsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      let scholarship: any = {
        author: id,
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        scholarship.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      const newScholarship = new ScholarshipsModel(scholarship);
      await newScholarship.save();

      res.status(201).json({
        message: "Scholarship created successfully",
        response: newScholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        titleOfScholarship,
        scholarshipType,
        nameOfProvider,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        applyLink,
      } = req.body;

      // Find the existing scholarship by ID
      const existingScholarship = await ScholarshipsModel.findById(
        req.params.id
      );

      if (!existingScholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // Update the scholarship with new data
      existingScholarship.titleOfScholarship =
        titleOfScholarship || existingScholarship.titleOfScholarship;
      existingScholarship.nameOfProvider =
        nameOfProvider || existingScholarship.nameOfProvider;
      existingScholarship.scholarshipType =
        scholarshipType || existingScholarship.scholarshipType;
      existingScholarship.deadline = deadline || existingScholarship.deadline;
      existingScholarship.summary = summary || existingScholarship.summary;
      existingScholarship.benefits = benefits || existingScholarship.benefits;
      existingScholarship.eligibility =
        eligibility || existingScholarship.eligibility;
      existingScholarship.application =
        application || existingScholarship.application;
      existingScholarship.moreInfoLink =
        moreInfoLink || existingScholarship.moreInfoLink;
      existingScholarship.applyLink =
        applyLink || existingScholarship.applyLink;
      if (req.file) {
        existingScholarship.image =
          `${req.file.fieldname}${req.file.filename}` ||
          existingScholarship.image;
        console.log(" existingModel.image :>> ", existingScholarship.image);
      }
      // Save the updated scholarship
      const updatedScholarship = await existingScholarship.save();

      let key = "/scholarships/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res.status(200).json({
        message: "Scholarship updated successfully",
        response: updatedScholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the scholarship by ID
      const scholarship = await ScholarshipsModel.findById(req.params.id);

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // If an image is uploaded, update the scholarship with the new image path
      if (req.file) {
        scholarship.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await scholarship.save(); // Save the updated scholarship
        res.status(201).json({
          message: "Scholarship image updated successfully",
          response: scholarship,
        });
      } else {
        return res.status(400).json({error: "No image uploaded"});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const key = req.originalUrl;
      // Check cache first
      // const cachedData = await redis.get(key);
      // if (cachedData) {
      //   console.log("✅ Returning cached data");
      //   return res.json({
      //     message: "Data found",
      //     response: JSON.parse(cachedData),
      //   });
      // }

      const scholarship = await ScholarshipsModel.findById(req.params.id);

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      // Cache the result for 1 hour (3600 seconds)
      // await redis.setEx(key, 3600, JSON.stringify(scholarship));
      res
        .status(200)
        .json({message: "Scholarship found", response: scholarship});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({
            message: "Data found",
            response: JSON.parse(cachedData),
          });
        }

        const models = await ScholarshipsModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({
            message: "Data found",
            response: JSON.parse(cachedData),
          });
        }

        const models = await ScholarshipsModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the scholarship by ID and update its status to 'DELETED'
      const scholarship = await ScholarshipsModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      let key = "/scholarships/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res.status(200).json({
        message: "Scholarship status updated to DELETED",
        response: scholarship,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the scholarship by ID (passed in the route params) and delete it permanently
      const scholarship = await ScholarshipsModel.findByIdAndDelete(
        req.params.id
      );

      if (!scholarship) {
        return res.status(404).json({error: "Scholarship not found"});
      }

      res.status(200).json({message: "Scholarship successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  // public
  // static async getAllPublic(req: Request, res: Response) {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = parseInt(req.query.limit as string) || 10;
  //     const skip = (page - 1) * limit;
  
  //     const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;
  
  //     // Check cache first
  //     // const cachedData = await redis.get(key);
  //     // if (cachedData) {
  //     //   console.log("✅ Returning cached data");
  //     //   return res.json(JSON.parse(cachedData));
  //     // }
  
  //     const [models, total] = await Promise.all([
  //       ScholarshipsModel.find({
  //         status: { $ne: "DELETED" },
  //       })
  //         .sort({ createdAt: -1 })
  //         .skip(skip)
  //         .limit(limit),
  //       ScholarshipsModel.countDocuments({ status: { $ne: "DELETED" } }),
  //     ]);
  
  //     const result = {
  //       message: "Data found",
  //       response: models,
  //       pagination: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };
  
  //     // Cache the result for 1 hour (3600 seconds)
  //     // await redis.setEx(key, 3600, JSON.stringify(result));
  
  //     res.status(200).json(result);
  //   } catch (error) {
  //     console.log('error :>> ', error);
  //     res.status(400).json({ error: error.message });
  //   }
  // }
  
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;
  
      // Check cache first
      // const cachedData = await redis.get(key);
      // if (cachedData) {
      //   console.log("✅ Returning cached data");
      //   return res.json(JSON.parse(cachedData));
      // }
  
      // Construct query
      const query: any = {
        status: { $ne: "DELETED" },
      };
  
      // Search
      const search = req.query.search as string;
      if (search) {
        query.$or = [
          { titleOfScholarship: { $regex: search, $options: "i" } },
          { nameOfProvider: { $regex: search, $options: "i" } },
          { summary: { $regex: search, $options: "i" } },
        ];
      }
  
      // Filters
      if (req.query.scholarshipType) {
        query.scholarshipType = req.query.scholarshipType;
      }
  
      // Filter by deadline >= current date
      const today = new Date();
      if (req.query.deadline || true) {
        query.deadline = { $gte: today };
      }
  
      const [models, total] = await Promise.all([
        ScholarshipsModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ScholarshipsModel.countDocuments(query),
      ]);
  
      const result = {
        message: "Data found",
        response: models,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
  
      // Cache the result for 1 hour (3600 seconds)
      // await redis.setEx(key, 3600, JSON.stringify(result));
  
      res.status(200).json(result);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }
  
}
