import {Request, Response} from "express";
import * as multer from "multer";
import ProfessionalCourseModel from "../schema/professionalcourse.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
        // course.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "professionals");
        if (result) {
          course.image = `${result.Key}`;
        }
      }

      const newCourse = new ProfessionalCourseModel(course);
      await newCourse.save();

      // Invalidate cache after creating new course
      await invalidateCache('PROFESSIONAL_COURSES');

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
        // existingCourse.image =
        //   `${req.file.fieldname}${req.file.filename}` || existingCourse.image;
        const result = await uploadFile(req.file, "professionals");
        if (result) {
          existingCourse.image = `${result.Key}`;
        }
      }
      // Save the updated course
      const updatedCourse = await existingCourse.save();
      
      // Invalidate cache after updating course
      await invalidateCache(req.params.id);
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
        // course.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "professionals");
        if (result) {
          course.image = `${result.Key}`;
        }
        await course.save(); // Save the updated course
        
        // Invalidate cache after updating image
        await invalidateCache(req.params.id);
        
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
      const key = CACHE_KEYS.PROFESSIONAL_COURSES.BY_ID(req.params.id);
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        console.log("✅ Returning cached data");
        return res.json({message: "Data found", response: cachedData});
      }
      const course = await ProfessionalCourseModel.findById(req.params.id);

      if (!course) {
        return res.status(404).json({error: "Professional course not found"});
      }

      // Cache the result
      await setCachedData(key, course, CACHE_DURATION.MEDIUM);
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
        const key = CACHE_KEYS.PROFESSIONAL_COURSES.ALL;
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await ProfessionalCourseModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({message: "Data found", response: models});
      } else {
        const key = getUserCacheKey(CACHE_KEYS.PROFESSIONAL_COURSES.ALL, id);
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await ProfessionalCourseModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
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

      // Invalidate cache after soft deletion
      await invalidateCache('PROFESSIONAL_COURSES', req.params.id);
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

      // Invalidate cache after permanent deletion
      await invalidateCache('PROFESSIONAL_COURSES', req.params.id);

      res.status(200).json({message: "Course successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }



  // Public
  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const nameOfProvider = req.query.nameOfProvider as string;
      const nameOfCourse = req.query.nameOfCourse as string;
      const disciplineCategory = req.query.disciplineCategory as string;
      const industry = req.query.industry as string;
      const location = req.query.location as string;
      const deliveryType = req.query.deliveryType as string;
      const language = req.query.language as string;
      const paymentType = req.query.paymentType as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across course name, provider, and content)
      if (search) {
        query.$or = [
          { nameOfCourse: { $regex: search, $options: 'i' } },
          { nameOfProvider: { $regex: search, $options: 'i' } },
          { aboutCourse: { $regex: search, $options: 'i' } },
          { courseContent: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (nameOfProvider) {
        query.nameOfProvider = { $regex: nameOfProvider, $options: 'i' };
      }

      if (nameOfCourse) {
        query.nameOfCourse = { $regex: nameOfCourse, $options: 'i' };
      }

      if (disciplineCategory) {
        query.disciplineCategory = { $regex: disciplineCategory, $options: 'i' };
      }

      if (industry) {
        query.industry = { $regex: industry, $options: 'i' };
      }

      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      if (deliveryType) {
        query.deliveryType = { $regex: deliveryType, $options: 'i' };
      }

      if (language) {
        query.language = { $regex: language, $options: 'i' };
      }

      if (paymentType) {
        query.paymentType = { $regex: paymentType, $options: 'i' };
      }

      // Filter out expired start dates unless explicitly requested
      if (includeExpired !== 'true') {
        query.$and = [
          {
            $or: [
              { nextStartDate: { $exists: false } },
              { nextStartDate: null },
              { nextStartDate: { $gte: new Date() } }
            ]
          }
        ];
      }

      // Create cache key that includes search and filter parameters
      const cacheKey = `professionalcourses_public_${page}_${limit}_${search || ''}_${nameOfProvider || ''}_${nameOfCourse || ''}_${disciplineCategory || ''}_${industry || ''}_${location || ''}_${deliveryType || ''}_${language || ''}_${paymentType || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        ProfessionalCourseModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        ProfessionalCourseModel.countDocuments(query)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      const responsePayload = {
        message: "Data found",
        metadata: {
          total,
          page,
          limit,
          totalPages,
          filters: {
            search: search || null,
            nameOfProvider: nameOfProvider || null,
            nameOfCourse: nameOfCourse || null,
            disciplineCategory: disciplineCategory || null,
            industry: industry || null,
            location: location || null,
            deliveryType: deliveryType || null,
            language: language || null,
            paymentType: paymentType || null,
            includeExpired: includeExpired === 'true' || null,
          }
        },
        response: models,
      };

      // Cache the result for 1 hour
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      res.status(200).json(responsePayload);
      
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({error: error.message});
    }
  }
  
}
