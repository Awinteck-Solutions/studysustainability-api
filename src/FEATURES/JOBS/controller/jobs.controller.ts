import {Request, Response} from "express";
import * as multer from "multer";
import JobsModel from "../schema/jobs.schema";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class JobsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        jobCategory,
        employer,
        jobTitle,
        jobType,
        workPreference,
        experienceLevel,
        organizationType,
        industry,
        location,
        country,
        salary,
        salaryRange,
        aboutCompany,
        overviewOfRole,
        jobDescription,
        idealPersonSpecifications,
        deadline,
        applyLink,
      } = req.body;

      let job: any = {
        author: id,
        jobCategory,
        employer,
        jobTitle,
        jobType,
        workPreference,
        experienceLevel,
        organizationType,
        industry,
        location,
        country,
        salary,
        salaryRange,
        aboutCompany,
        overviewOfRole,
        jobDescription,
        idealPersonSpecifications,
        deadline,
        applyLink,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        job.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      const newJob = new JobsModel(job);
      await newJob.save();

      res
        .status(201)
        .json({message: "Job created successfully", response: newJob});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        jobCategory,
        employer,
        jobTitle,
        jobType,
        workPreference,
        experienceLevel,
        organizationType,
        industry,
        location,
        country,
        salary,
        salaryRange,
        aboutCompany,
        overviewOfRole,
        jobDescription,
        idealPersonSpecifications,
        deadline,
        applyLink,
      } = req.body;

      // Find the existing job by ID
      const existingJob = await JobsModel.findById(req.params.id);

      if (!existingJob) {
        return res.status(404).json({error: "Job not found"});
      }

      // Update the job with new data
      existingJob.jobCategory = jobCategory || existingJob.jobCategory;
      existingJob.employer = employer || existingJob.employer;
      existingJob.jobTitle = jobTitle || existingJob.jobTitle;
      existingJob.jobType = jobType || existingJob.jobType;
      existingJob.workPreference = workPreference || existingJob.workPreference;
      existingJob.experienceLevel =
        experienceLevel || existingJob.experienceLevel;
      existingJob.organizationType =
        organizationType || existingJob.organizationType;
      existingJob.industry = industry || existingJob.industry;
      existingJob.location = location || existingJob.location;
      existingJob.country = country || existingJob.country;
      existingJob.salary = salary || existingJob.salary;
      existingJob.salaryRange = salaryRange || existingJob.salaryRange;
      existingJob.aboutCompany = aboutCompany || existingJob.aboutCompany;
      existingJob.overviewOfRole = overviewOfRole || existingJob.overviewOfRole;
      existingJob.jobDescription = jobDescription || existingJob.jobDescription;
      existingJob.idealPersonSpecifications =
        idealPersonSpecifications || existingJob.idealPersonSpecifications;
      existingJob.deadline = deadline || existingJob.deadline;
      existingJob.applyLink = applyLink || existingJob.applyLink;
      if (req.file) {
        existingJob.image =
          `${req.file.fieldname}${req.file.filename}` || existingJob.image;
        console.log(" existingModel.image :>> ", existingJob.image);
      }
      // Save the updated job
      const updatedJob = await existingJob.save();
            let key = '/jobs/'
            redis.del(key)
            redis.del(`${key}${req.params.id}`)
      res
        .status(200)
        .json({message: "Job updated successfully", response: updatedJob});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the job by ID
      const job = await JobsModel.findById(req.params.id);

      if (!job) {
        return res.status(404).json({error: "Job not found"});
      }

      // If an image is uploaded, update the job with the new image path
      if (req.file) {
        job.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await job.save(); // Save the updated job
        res
          .status(201)
          .json({message: "Job image updated successfully", response: job});
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
      //   return res.json({message: "Data found", response: JSON.parse(cachedData)});
      // }

      const job = await JobsModel.findById(req.params.id);

      if (!job) {
        return res.status(404).json({error: "Job not found"});
      }

       // Cache the result for 1 hour (3600 seconds)
      //  await redis.setEx(key, 3600, JSON.stringify(job));
      res.status(200).json({message: "Job found", response: job});
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
        const models = await JobsModel.find({
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
        const models = await JobsModel.find({
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
      // Find the job by ID and update its status to 'DELETED'
      const job = await JobsModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!job) {
        return res.status(404).json({error: "Job not found"});
      }

      let key = '/jobs/'
      redis.del(key)
      redis.del(`${key}${req.params.id}`)

      res
        .status(200)
        .json({message: "Job status updated to DELETED", response: job});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the job by ID (passed in the route params) and delete it permanently
      const job = await JobsModel.findByIdAndDelete(req.params.id);

      if (!job) {
        return res.status(404).json({error: "Job not found"});
      }

      res.status(200).json({message: "Job successfully deleted"});
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
  
      const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;
  
      // Check cache first
      // const cachedData = await redis.get(key);
      // if (cachedData) {
      //   console.log("✅ Returning cached data");
      //   return res.json(JSON.parse(cachedData));
      // }
  
      const [models, total] = await Promise.all([
        JobsModel.find({ status: { $ne: "DELETED" } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        JobsModel.countDocuments({ status: { $ne: "DELETED" } }),
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
      res.status(400).json({ error: error.message });
    }
  }
  
}
