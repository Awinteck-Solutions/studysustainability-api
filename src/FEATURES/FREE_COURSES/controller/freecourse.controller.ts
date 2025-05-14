import {Request, Response} from "express";
import * as multer from "multer";
import FreeCourseModel from "../schema/freecourse.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import redis from "../../../util/redis";
// const Redis = require("ioredis");
// const redis = new Redis();

interface MulterRequest extends Request {
  file: multer.File;
}

export class FreeCourseController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        nameOfInstitution,
        titleOfCourse,
        language,
        certificate,
        discipline,
        module,
        nextStartDate,
        location,
        delivery,
        duration,
        assessment,
        aboutCourse,
        courseContent,
        instructorDetails,
        howToApply,
        registerInterestForm,
        applyLink,
      } = req.body;

      let freeCourseData: any = {
        author: id,
        nameOfInstitution,
        titleOfCourse,
        language,
        certificate,
        discipline,
        module,
        nextStartDate,
        location,
        delivery,
        duration,
        assessment,
        aboutCourse,
        courseContent,
        instructorDetails,
        howToApply,
        registerInterestForm,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        freeCourseData.image = `${req.file.fieldname}${req.file.filename}`;
      }

      // Create a new FreeCourse model and save it
      const newFreeCourse = new FreeCourseModel(freeCourseData);
      await newFreeCourse.save();

      res.status(201).json({
        message: "Free Course created successfully",
        response: newFreeCourse,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        nameOfInstitution,
        titleOfCourse,
        language,
        certificate,
        discipline,
        module,
        nextStartDate,
        location,
        delivery,
        duration,
        assessment,
        aboutCourse,
        courseContent,
        instructorDetails,
        howToApply,
        registerInterestForm,
        applyLink,
      } = req.body;

      // Find the existing FreeCourse document by ID (passed in the route params)
      const existingFreeCourse = await FreeCourseModel.findById(req.params.id);

      if (!existingFreeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      // Update the free course with new data
      existingFreeCourse.nameOfInstitution =
        nameOfInstitution || existingFreeCourse.nameOfInstitution;
      existingFreeCourse.titleOfCourse =
        titleOfCourse || existingFreeCourse.titleOfCourse;
      existingFreeCourse.language = language || existingFreeCourse.language;
      existingFreeCourse.certificate =
        certificate || existingFreeCourse.certificate;
      existingFreeCourse.discipline =
        discipline || existingFreeCourse.discipline;
      existingFreeCourse.module = module || existingFreeCourse.module;
      existingFreeCourse.nextStartDate =
        nextStartDate || existingFreeCourse.nextStartDate;
      existingFreeCourse.location = location || existingFreeCourse.location;
      existingFreeCourse.delivery = delivery || existingFreeCourse.delivery;
      existingFreeCourse.duration = duration || existingFreeCourse.duration;
      existingFreeCourse.assessment =
        assessment || existingFreeCourse.assessment;
      existingFreeCourse.aboutCourse =
        aboutCourse || existingFreeCourse.aboutCourse;
      existingFreeCourse.courseContent =
        courseContent || existingFreeCourse.courseContent;
      existingFreeCourse.instructorDetails =
        instructorDetails || existingFreeCourse.instructorDetails;
      existingFreeCourse.howToApply =
        howToApply || existingFreeCourse.howToApply;
      existingFreeCourse.registerInterestForm =
        registerInterestForm || existingFreeCourse.registerInterestForm;
      existingFreeCourse.applyLink = applyLink || existingFreeCourse.applyLink;
      if (req.file) {
        registerInterestForm.image =
          `${req.file.fieldname}${req.file.filename}` ||
          registerInterestForm.image;
        console.log(" existingModel.image :>> ", registerInterestForm.image);
      }
      // Save the updated FreeCourse model
      const updatedFreeCourse = await existingFreeCourse.save();
      let key = "/free-courses/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);

      res
        .status(200)
        .json({message: "Free Course updated", response: updatedFreeCourse});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the FreeCourse model by ID (passed in the route params)
      const freeCourse = await FreeCourseModel.findById(req.params.id);

      if (!freeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      // If an image is uploaded, update the model with the new image path
      if (req.file) {
        freeCourse.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await freeCourse.save(); // Save the updated model
        res.status(201).json({
          message: "Free Course image updated successfully",
          response: freeCourse,
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
      // const cachedData = await redis.get(key);
      // if (cachedData) {
      //   console.log("✅ Returning cached data");
      //   return res.json({
      //     message: "Data found",
      //     response: JSON.parse(cachedData),
      //   });
      // }

      const freeCourse = await FreeCourseModel.findById(req.params.id);

      if (!freeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      // await redis.setEx(key, 3600, JSON.stringify(freeCourse));
      res
        .status(200)
        .json({message: "Free Course found", response: freeCourse});
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

        const models = await FreeCourseModel.find(
          {
            status: {$ne: "DELETED"},
          },
          "resourceId nameOfInstitution titleOfCourse module duration createdAt status"
        ).sort({createdAt: -1});

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

        const models = await FreeCourseModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
      }
    } catch (error) {
      console.log("error :>> ", error);
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the FreeCourse model by ID and update its status to 'DELETED'
      const freeCourse = await FreeCourseModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!freeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      let key = "/free-courses/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);

      res
        .status(200)
        .json({message: "Free Course status updated to DELETED", freeCourse});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the FreeCourse model by ID and delete it permanently
      const freeCourse = await FreeCourseModel.findByIdAndDelete(req.params.id);

      if (!freeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      res.status(200).json({message: "Free Course successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  //public
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
  
      const [models, total] = await Promise.all([
        FreeCourseModel.find({ status: { $ne: "DELETED" } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        FreeCourseModel.countDocuments({ status: { $ne: "DELETED" } }),
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
      console.log("error :>> ", error);
      res.status(400).json({ error: error.message });
    }
  }
  
}
