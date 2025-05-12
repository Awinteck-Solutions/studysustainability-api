import {Request, Response} from "express";
import * as multer from "multer";
import ProfessionalCourseModel from "../schema/professionalcourse.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class ProfessionalCourseController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        professional,
        nameOfProvider,
        nameOfCourse,
        duration,
        dates,
        nextStartDate,
        fees,
        paymentType,
        disciplineCategory,
        industry,
        location,
        deliveryType,
        cdpHour,
        aboutCourse,
        courseContent,
        whoShouldAttend,
        uponCompletion,
        accreditation,
        registerInterestForm,
        applyLink,
        language,
      } = req.body;

      let course: any = {
        author: id,
        professional,
        nameOfProvider,
        nameOfCourse,
        duration,
        dates,
        nextStartDate,
        fees,
        paymentType,
        disciplineCategory,
        industry,
        location,
        deliveryType,
        cdpHour,
        aboutCourse,
        courseContent,
        whoShouldAttend,
        uponCompletion,
        accreditation,
        registerInterestForm,
        applyLink,
        language,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        course.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      const newCourse = new ProfessionalCourseModel(course);
      await newCourse.save();

      res
        .status(201)
        .json({
          message: "Professional course created successfully",
          response: newCourse,
        });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        professional,
        nameOfProvider,
        nameOfCourse,
        duration,
        dates,
        nextStartDate,
        fees,
        paymentType,
        disciplineCategory,
        industry,
        location,
        deliveryType,
        cdpHour,
        aboutCourse,
        courseContent,
        whoShouldAttend,
        uponCompletion,
        accreditation,
        registerInterestForm,
        applyLink,
        language,
      } = req.body;

      // Find the existing course by ID
      const existingCourse = await ProfessionalCourseModel.findById(
        req.params.id
      );

      if (!existingCourse) {
        return res.status(404).json({error: "Professional course not found"});
      }

      // Update the course with new data
      existingCourse.professional = professional || existingCourse.professional;
      existingCourse.nameOfProvider =
        nameOfProvider || existingCourse.nameOfProvider;
      existingCourse.nameOfCourse = nameOfCourse || existingCourse.nameOfCourse;
      existingCourse.duration = duration || existingCourse.duration;
      existingCourse.dates = dates || existingCourse.dates;
      existingCourse.nextStartDate =
        nextStartDate || existingCourse.nextStartDate;
      existingCourse.fees = fees || existingCourse.fees;
      existingCourse.paymentType = paymentType || existingCourse.paymentType;
      existingCourse.disciplineCategory =
        disciplineCategory || existingCourse.disciplineCategory;
      existingCourse.industry = industry || existingCourse.industry;
      existingCourse.location = location || existingCourse.location;
      existingCourse.deliveryType = deliveryType || existingCourse.deliveryType;
      existingCourse.cdpHour = cdpHour || existingCourse.cdpHour;
      existingCourse.aboutCourse = aboutCourse || existingCourse.aboutCourse;
      existingCourse.courseContent =
        courseContent || existingCourse.courseContent;
      existingCourse.whoShouldAttend =
        whoShouldAttend || existingCourse.whoShouldAttend;
      existingCourse.uponCompletion =
        uponCompletion || existingCourse.uponCompletion;
      existingCourse.accreditation =
        accreditation || existingCourse.accreditation;
      existingCourse.registerInterestForm =
        registerInterestForm || existingCourse.registerInterestForm;
      existingCourse.applyLink = applyLink || existingCourse.applyLink;
      existingCourse.language = language || existingCourse.language;
      if (req.file) {
        existingCourse.image =
          `${req.file.fieldname}${req.file.filename}` || existingCourse.image;
        console.log(" existingModel.image :>> ", existingCourse.image);
      }
      // Save the updated course
      const updatedCourse = await existingCourse.save();
      let key = '/professional-courses/'
      redis.del(key)
      redis.del(`${key}${req.params.id}`)
      res
        .status(200)
        .json({
          message: "Professional course updated successfully",
          response: updatedCourse,
        });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the course by ID
      const course = await ProfessionalCourseModel.findById(req.params.id);

      if (!course) {
        return res.status(404).json({error: "Course not found"});
      }

      // If an image is uploaded, update the course with the new image path
      if (req.file) {
        course.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await course.save(); // Save the updated course
        res
          .status(201)
          .json({
            message: "Course image updated successfully",
            response: course,
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
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json({message: "Data found", response: JSON.parse(cachedData)});
      }
      const course = await ProfessionalCourseModel.findById(req.params.id);

      if (!course) {
        return res.status(404).json({error: "Professional course not found"});
      }


         // Cache the result for 1 hour (3600 seconds)
         await redis.setEx(key, 3600, JSON.stringify(course));
      res
        .status(200)
        .json({message: "Professional course found", response: course});
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
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await ProfessionalCourseModel.find({
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
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await ProfessionalCourseModel.find({
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
      // Find the course by ID and update its status to 'DELETED'
      const course = await ProfessionalCourseModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!course) {
        return res.status(404).json({error: "Course not found"});
      }

      let key = '/professional-courses/'
      redis.del(key)
      redis.del(`${key}${req.params.id}`)
      res
        .status(200)
        .json({message: "Course status updated to DELETED", response: course});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the course by ID (passed in the route params) and delete it permanently
      const course = await ProfessionalCourseModel.findByIdAndDelete(
        req.params.id
      );

      if (!course) {
        return res.status(404).json({error: "Course not found"});
      }

      res.status(200).json({message: "Course successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }



  // Public
  static async getAllPublic(req: Request, res: Response) {
    try {
     
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await ProfessionalCourseModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});


         // Cache the result for 1 hour (3600 seconds)
         await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Data found", response: models});
     
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }
}
