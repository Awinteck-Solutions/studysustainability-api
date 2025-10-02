import {Request, Response} from "express";
import * as multer from "multer";
import FreeCourseModel from "../schema/freecourse.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
import InterestForm from "../../INTERESTFORM/schema/InterestForm.schema";
import Engagement from "../../Engagement/schema/Engagement.schema";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
        // freeCourseData.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "freecourse");
        if (result) {
          freeCourseData.image = `${result.Key}`;
        }
      }

      // Create a new FreeCourse model and save it
      const newFreeCourse = new FreeCourseModel(freeCourseData);
      await newFreeCourse.save();

      // Invalidate cache after creating new free course
      await invalidateCache('FREE_COURSES');

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
        // existingFreeCourse.image =
        //   `${req.file.fieldname}${req.file.filename}` ||
        //   existingFreeCourse.image;
        const result = await uploadFile(req.file, "freecourse");
        if (result) {
          existingFreeCourse.image = `${result.Key}`;
        }
      }
      // Save the updated FreeCourse model
      const updatedFreeCourse = await existingFreeCourse.save();
      
      // Invalidate cache after updating free course
      await invalidateCache('FREE_COURSES', req.params.id);

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
        // freeCourse.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "freecourse");
        if (result) {
          freeCourse.image = `${result.Key}`;
        }
        await freeCourse.save(); // Save the updated model
        
        // Invalidate cache after updating image
        await invalidateCache('FREE_COURSES', req.params.id);
        
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
      const key = CACHE_KEYS.FREE_COURSES.BY_ID(req.params.id);
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({
          message: "Data found",
          response: cachedData,
        });
      }

      const freeCourse = await FreeCourseModel.findById(req.params.id);

      if (!freeCourse) {
        return res.status(404).json({error: "Free Course not found"});
      }

      await setCachedData(key, freeCourse, CACHE_DURATION.MEDIUM);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination
        const cacheKey = `freecourses_admin_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          FreeCourseModel.find(
            {
              status: {$ne: "DELETED"},
            },
            "resourceId nameOfInstitution titleOfCourse module duration createdAt status"
          ).sort({createdAt: -1}).skip(skip).limit(limit),
          FreeCourseModel.countDocuments({status: {$ne: "DELETED"}})
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
              status: "ACTIVE,INACTIVE,REJECTED"
            }
          },
          response: models,
        };

        // Cache the result for 1 hour
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // Create cache key with pagination for user-specific data
        const cacheKey = `freecourses_user_${id}_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          FreeCourseModel.find({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          FreeCourseModel.countDocuments({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"}
          })
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
              status: "ACTIVE,INACTIVE,REJECTED"
            }
          },
          response: models,
        };

        // Cache the result for 1 hour
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
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

      // Invalidate cache after permanent deletion
      await invalidateCache('FREE_COURSES', req.params.id);

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

      // Invalidate cache after permanent deletion
      await invalidateCache('FREE_COURSES', req.params.id);

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
      
      // Extract search and filter parameters
      const search = req.query.search as string;
      const nameOfInstitution = req.query.nameOfInstitution as string;
      const discipline = req.query.discipline as string;
      const language = req.query.language as string;
      const delivery = req.query.delivery as string;
      const location = req.query.location as string;
      const certificate = req.query.certificate as string;
      const assessment = req.query.assessment as string;
      const includeExpired = req.query.includeExpired as string;

      // Build the base query
      let query: any = { status: "ACTIVE" };

      // Add search functionality (searches across course title, institution, and content)
      if (search) {
        query.$or = [
          { titleOfCourse: { $regex: search, $options: 'i' } },
          { nameOfInstitution: { $regex: search, $options: 'i' } },
          { aboutCourse: { $regex: search, $options: 'i' } },
          { courseContent: { $regex: search, $options: 'i' } }
        ];
      }

      // Add filter parameters
      if (nameOfInstitution) {
        query.nameOfInstitution = { $regex: nameOfInstitution, $options: 'i' };
      }

      if (discipline) {
        query.discipline = { $regex: discipline, $options: 'i' };
      }

      if (language) {
        query.language = { $regex: language, $options: 'i' };
      }

      if (delivery) {
        query.delivery = { $regex: delivery, $options: 'i' };
      }

      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }

      if (certificate) {
        query.certificate = certificate === 'true';
      }

      if (assessment) {
        query.assessment = assessment === 'true';
      }
 
      // Create cache key that includes search and filter parameters
      const cacheKey = `freecourses_public_${page}_${limit}_${search || ''}_${nameOfInstitution || ''}_${discipline || ''}_${language || ''}_${delivery || ''}_${location || ''}_${certificate || ''}_${assessment || ''}_${includeExpired || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [models, total] = await Promise.all([
        FreeCourseModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        FreeCourseModel.countDocuments(query)
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
            nameOfInstitution: nameOfInstitution || null,
            discipline: discipline || null,
            language: language || null,
            delivery: delivery || null,
            location: location || null,
            certificate: certificate || null,
            assessment: assessment || null,
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

  // GET FREE COURSES STATISTICS
  static async getStats(req: Request, res: Response) {
    try {
      const { role } = req["currentUser"];
      
      // Only allow ADMIN role to access statistics
      if (role !== Roles.ADMIN) {
        return res.status(403).json({
          status: false,
          message: "Access denied. Admin privileges required.",
        });
      }

      const cacheKey = 'freecourses_stats';
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get statistics
      const [
        totalCourses,
        activeCourses,
        inactiveCourses,
        institutionStats,
        disciplineStats,
        recentCourses,
        totalEnrolled,
        totalEngagements
      ] = await Promise.all([
        FreeCourseModel.countDocuments({  status: { $ne: "DELETED" }}),
        FreeCourseModel.countDocuments({ status: "ACTIVE" }),
        FreeCourseModel.countDocuments({ status: "INACTIVE" }),
        FreeCourseModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$nameOfInstitution", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        FreeCourseModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$discipline", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        FreeCourseModel.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        }),
        InterestForm.countDocuments({ status: "ACTIVE", menu: 'FreeCourse' }),
        Engagement.countDocuments({ itemType: 'FREE_COURSE' })
      ]);

      const stats = {
        totalCourses,
        activeCourses,
        inactiveCourses,
        institutionBreakdown: institutionStats.map(stat => ({
          institution: stat._id,
          count: stat.count
        })),
        disciplineBreakdown: disciplineStats.map(stat => ({
          discipline: stat._id,
          count: stat.count
        })),
        recentCourses, // Courses created in last 7 days
        statusBreakdown: {
          active: activeCourses,
          inactive: inactiveCourses
        },
        // Additional platform statistics
        totalEnrolled, // Total active interest form submissions for free courses
        totalEngagements // Total engagement records for free courses
      };

      const responsePayload = {
        status: true,
        message: "Free Courses statistics retrieved successfully",
        response: stats,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: req["currentUser"].id
        }
      };

      // Cache the result for 30 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.SHORT);
      
      return res.status(200).json(responsePayload);
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  
}
