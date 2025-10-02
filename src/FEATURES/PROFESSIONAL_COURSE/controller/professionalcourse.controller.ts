import {Request, Response} from "express";
import * as multer from "multer";
import ProfessionalCourseModel from "../schema/professionalcourse.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
import Engagement from "../../Engagement/schema/Engagement.schema";
import InterestForm from "../../INTERESTFORM/schema/InterestForm.schema";

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
      await invalidateCache('ANALYTICS');

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
        status,
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
      existingCourse.status = status || existingCourse.status;
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
      await invalidateCache('ANALYTICS');
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination
        const cacheKey = `professionalcourses_admin_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          // console.log("✅ Returning cached data");
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          ProfessionalCourseModel.find({
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          ProfessionalCourseModel.countDocuments({status: {$ne: "DELETED"}})
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

        // Cache the result
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // Create cache key with pagination for user-specific data
        const cacheKey = `professionalcourses_user_${id}_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          // console.log("✅ Returning cached data");
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          ProfessionalCourseModel.find({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          ProfessionalCourseModel.countDocuments({
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

        // Cache the result
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
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
       invalidateCache('PROFESSIONAL_COURSES', req.params.id);
      await invalidateCache('ANALYTICS');
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

  static async getProfessionalDashboardMetrics(req: Request, res: Response) {
    try {
      const professionalUserId = req["currentUser"].id;

      if (!professionalUserId) {
        return res.status(400).json({
          success: false,
          message: "Professional user ID is required",
        });
      }

      const professionalObjectId = new mongoose.Types.ObjectId(
        professionalUserId
      );

      // 1️⃣ Total professional courses & active courses
      const [totalCourses, totalActiveCourses] = await Promise.all([
        ProfessionalCourseModel.countDocuments({
          professional: professionalObjectId, status: {$ne: "DELETED"}
        }),
        ProfessionalCourseModel.countDocuments({
          professional: professionalObjectId,
          status: "ACTIVE",
        }),
      ]);

      // 2️⃣ Get all course _ids for this professional user
      const courseIds = await ProfessionalCourseModel.find(
        {professional: professionalObjectId},
        {_id: 1}
      ).lean();

      const courseIdList = courseIds.map((c) => c._id);

      // 3️⃣ Total registered interests
      const totalRegisteredInterests = await InterestForm.countDocuments({
        menuId: {$in: courseIdList},
        menu: "ProfessionalCourses",
      });

      // 4️⃣ Total views from Engagement (type: VIEW)
      const engagementAggregation = await Engagement.aggregate([
        {
          $match: {
            item: {$in: courseIdList},
            type: "VIEW",
          },
        },
        {
          $group: {
            _id: null,
            totalViews: {$sum: "$value"},
          },
        },
      ]);

      const totalViews =
        engagementAggregation.length > 0
          ? engagementAggregation[0].totalViews
          : 0;

      return res.status(200).json({
        success: true,
        message: "Professional dashboard metrics fetched successfully",
        response: {
          totalCourses,
          totalActiveCourses,
          totalRegisteredInterests,
          totalViews,
        },
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

      const professionalCourse = await ProfessionalCourseModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!professionalCourse) {
        return res.status(404).json({
          success: false,
          message: "Professional Course not found",
        });
      }

      // Invalidate analytics cache
      await invalidateCache('ANALYTICS');
      // invalidate cache for the professional course
      invalidateCache('PROFESSIONAL_COURSES', id);

      return res.status(200).json({
        success: true,
        message: "Professional Course status updated successfully",
        response: professionalCourse,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  // GET PROFESSIONAL COURSES STATISTICS
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

      const cacheKey = 'professionalcourses_stats';
      
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
        providerStats,
        industryStats,
        recentCourses,
        totalEnrolled,
        totalEngagements
      ] = await Promise.all([
        ProfessionalCourseModel.countDocuments({  status: { $ne: "DELETED" }}),
        ProfessionalCourseModel.countDocuments({ status: "ACTIVE" }),
        ProfessionalCourseModel.countDocuments({ status: "INACTIVE" }),
        ProfessionalCourseModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$nameOfProvider", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        ProfessionalCourseModel.aggregate([
          { $match: { status: { $ne: "DELETED" } } },
          { $group: { _id: "$industry", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        ProfessionalCourseModel.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        }),
        InterestForm.countDocuments({ status: "ACTIVE", menu: 'ProfessionalCourses' }),
        Engagement.countDocuments({ itemType: 'PROFESSIONAL_PROGRAM' })
      ]);

      const stats = {
        totalCourses,
        activeCourses,
        inactiveCourses,
        providerBreakdown: providerStats.map(stat => ({
          provider: stat._id,
          count: stat.count
        })),
        industryBreakdown: industryStats.map(stat => ({
          industry: stat._id,
          count: stat.count
        })),
        recentCourses, // Courses created in last 7 days
        statusBreakdown: {
          active: activeCourses,
          inactive: inactiveCourses
        },
        // Additional platform statistics
        totalEnrolled, // Total active interest form submissions for professional courses
        totalEngagements // Total engagement records for professional courses
      };

      const responsePayload = {
        status: true,
        message: "Professional Courses statistics retrieved successfully",
        response: stats,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: req["currentUser"].id
        }
      };

      // Cache the result for 30 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      
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
