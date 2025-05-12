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
import redis from "../../../util/redis";
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
        .then((response) => {
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
        .then((result) => {

          let key = '/admin-management/list'
          redis.del(key)
          redis.del(`${key}/list/${req.params.id}`)

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

      // TOTAL RESOURCES CREATED BY USERS
      AdminModel.find({status: {$ne: "DELETED"}})
        .then((response) => {
          console.log('AdminModel-response :>> ', response);
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
          Promise.all(data).then(async (result) => {
            // Cache the result for 1 hour (3600 seconds)
            await redis.setEx(key, 3600, JSON.stringify(result));
            return res.status(200).json({
              status: true,
              message: "Success",
              response: result,
            });
          });
        })
        .catch((error) => {
          return res.status(404).json({
            status: false,
            message: "failed",
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

  // GET SINGLE USERS
  static async findOne(req: Request, res: Response) {
    try {
      let { id } = req.params;
      
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

      AdminModel.findOne({_id: id})
        .then(async (response) => {
           // Cache the result for 1 hour (3600 seconds)
          await redis.setEx(key, 3600, JSON.stringify(response));
          
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

      let key = '/admin-management/list'
      redis.del(key)
      redis.del(`${key}/list/${req.params.id}`)

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
}
