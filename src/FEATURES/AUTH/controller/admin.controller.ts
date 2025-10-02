import {Request, Response} from "express";
import {encrypt} from "../../../helpers/tokenizer";
import multer from "multer";
import AdminModel from "../schema/admin.schema";
import {v4 as uuidv4} from "uuid";
import getRandomInt from "../../../helpers/random";
import {Roles} from "../enums/roles.enum";
import {Permission} from "../enums/permission.enum";
import {formatAdminResponse} from "../dto/admin.dto";
import {sendMail} from "../../../helpers/emailer";
import CareerModel from "../../CAREER/schema/career.schema";
import FreeCourseModel from "../../FREE_COURSES/schema/freecourse.schema";
import UniProgramModel from "../../UNIVERSITY_PROGRAMS/schema/uniprograms.schema";
import ScholarshipsModel from "../../SCHOLARSHIPS/schema/scholarships.schema";
import ProfessionalCourseModel from "../../PROFESSIONAL_COURSE/schema/professionalcourse.schema";
import JobsModel from "../../JOBS/schema/jobs.schema";
import GrantsModel from "../../GRANTS/schema/grants.schema";
import FellowshipModel from "../../FELLOWSHIP/schema/fellowship.schema";
import EventsModel from "../../EVENTS/schema/events.schema";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData } from "../../../util/redis-helper";
// Extend Express Request to include Multer's file property
interface MulterRequest extends Request {
  file: multer.File;
}
export class AdminController {
  // Admin routes

  // SIGNUP
  static async createAdmin(req: Request, res: Response) {
    try {
      const {firstname, lastname, email, role, permissions} = req.body;

      // Check if the email already exists
      //generate OTP code
      var otp = getRandomInt(999, 9999);

      const admin = AdminModel({
        firstname,
        lastname,
        email,
        password: null,
        otp,
        role: role ?? Roles.ADMIN,
        permissions: permissions?.split(",") ?? [Permission.ALL],
      });
      admin
        .save()
        .then(async (response) => {
          // Clear cache when new admin is created
          await invalidateCache('ADMIN');
          
          return res.status(201).json({
            message: "New admin created",
            response,
          });
        })
        .catch((error) => {
          console.log("error :>> ", error.message);
          return res.status(404).json({
            message: "Unsuccessful account creation",
            other: error.message,
          });
        });

      sendMail(
        admin.email,
        admin.firstname,
        "StudySustainabilityHub - Welcome",
        "adminCreationHtml",
        `https://admin.studysustainabilityHub.com/admin/reset-password/${otp}`
      );
    } catch (error) {
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // DELETE ACCOUNT
  static async deleteOne(req: Request, res: Response) {
    try {
      const {id} = req.params;

      AdminModel.findOneAndUpdate(
        {_id: id},
        {$set: {status: "DELETED"}},
        {new: true, runValidators: true}
      )
        .then(async (result) => {
          // Invalidate cache after deleting admin
          await invalidateCache('ADMIN', req.params.id);

          return res.status(201).json({
            status: true,
            message: "User delete success",
          });
        })
        .catch((error) => {
          return res.status(404).json({
            status: false,
            message: "User delete failed",
            other: error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET ALL USERS
  static async findAll(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract filter parameters
      const userRole = req.query.role as string;
      const search = req.query.search as string;

      // Create cache key with pagination and filters
      const cacheKey = `admin_${role}_${id}_${page}_${limit}_${userRole || ''}_${search || ''}`;
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Build query
      let query: any = { status: { $ne: "DELETED" } };

      if (userRole) {
        query.role = userRole;
      }

      if (search) {
        query.$or = [
          { firstname: { $regex: search, $options: 'i' } },
          { lastname: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get total count for pagination
      const total = await AdminModel.countDocuments(query);

      // Get paginated results
      const response = await AdminModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Calculate resource counts for each admin
      let data = response.map(async (value) => {
        const totalCareer = await CareerModel.countDocuments({
          author: value._id,
        });
        const totalFreeCourse = await FreeCourseModel.countDocuments({
          author: value._id,
        });
        const totalEvents = await EventsModel.countDocuments({
          author: value._id,
        });
        const totalFellowship = await FellowshipModel.countDocuments({
          author: value._id,
        });
        const totalGrants = await GrantsModel.countDocuments({
          author: value._id,
        });
        const totalJobs = await JobsModel.countDocuments({
          author: value._id,
        });
        const totalProfessional =
          await ProfessionalCourseModel.countDocuments({
            author: value._id,
          });
        const totalScholarships = await ScholarshipsModel.countDocuments({
          author: value._id,
        });
        const totalUniversity = await UniProgramModel.countDocuments({
          author: value._id,
        });

        return {
          totalCareer,
          totalGrants,
          totalJobs,
          totalEvents,
          totalFellowship,
          totalProfessional,
          totalFreeCourse,
          totalUniversity,
          totalScholarships,
          ...value._doc,
        };
      });

      const result = await Promise.all(data);
      const totalPages = Math.ceil(total / limit);

      const responsePayload = {
        status: true,
        message: "Admins retrieved successfully",
        response: result,
        metadata: {
          total,
          page,
          limit,
          totalPages,
          filters: {
            role: userRole || null,
            search: search || null,
          }
        }
      };

      // Cache the result
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      
      return res.status(200).json(responsePayload);
    } catch (error) {
      console.log('error :>> ', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET SINGLE USERS
  static async findOne(req: Request, res: Response) {
    try {
      let { id } = req.params;
      
      const key = CACHE_KEYS.ADMIN.BY_ID(id);
      
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({
          status: true,
          message: "Data found",
          response: cachedData,
        });
      }

      AdminModel.findOne({_id: id})
        .then(async (response) => {
           // Cache the result for 1 hour
          await setCachedData(key, response, CACHE_DURATION.MEDIUM);
          
          return res.status(201).json({
            status: true,
            message: "User success",
            response,
          });
        })
        .catch((error) => {
          return res.status(404).json({
            status: false,
            message: "User failed",
            other: error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET ALL USERS
  static async update(req: Request, res: Response) {
    try {
      let {id} = req.params;
      console.log("id :>> ", id);
      let {status, firstname, lastname, email, role, permissions} = req.body;
      let model = await AdminModel.findOne({_id: id});

      model.firstname = firstname || model.firstname;
      model.lastname = lastname || model.lastname;
      model.email = email || model.email;
      model.role = role || model.role;
      model.permissions = permissions?.split(",") || model.permissions;
      model.status = status;

      const response = await model.save();

      // Invalidate cache after updating admin
      await invalidateCache('ADMIN', req.params.id);

      return res.status(201).json({
        status: true,
        message: "User success",
        response,
      });
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // GET ADMIN STATISTICS
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

      const cacheKey = 'admin_stats';
      
      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Get statistics
      const [
        totalAccounts,
        activeAccounts,
        inactiveAccounts,
        deletedAccounts,
        adminAccounts,
        userAccounts,
        universityAccounts,
        recentAccounts
      ] = await Promise.all([
        AdminModel.countDocuments({}),
        AdminModel.countDocuments({ status: "ACTIVE" }),
        AdminModel.countDocuments({ status: "INACTIVE" }),
        AdminModel.countDocuments({ status: "DELETED" }),
        AdminModel.countDocuments({ role: Roles.ADMIN, status: { $ne: "DELETED" } }),
        AdminModel.countDocuments({ role: Roles.USER, status: { $ne: "DELETED" } }),
        AdminModel.countDocuments({ role: Roles.UNIVERSITY, status: { $ne: "DELETED" } }),
        AdminModel.countDocuments({ 
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: { $ne: "DELETED" }
        })
      ]);

      const stats = {
        totalAccounts,
        activeAccounts,
        inactiveAccounts,
        deletedAccounts,
        roleBreakdown: {
          admin: adminAccounts,
          user: userAccounts,
          university: universityAccounts
        },
        recentAccounts, // Accounts created in last 7 days
        statusBreakdown: {
          active: activeAccounts,
          inactive: inactiveAccounts,
          deleted: deletedAccounts
        }
      };

      const responsePayload = {
        status: true,
        message: "Admin statistics retrieved successfully",
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
