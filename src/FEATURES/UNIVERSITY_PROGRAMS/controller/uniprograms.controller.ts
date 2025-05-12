import {Request, Response} from "express";
import UniProgramModel from "../schema/uniprograms.schema";
import * as multer from "multer";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import redis from "../../../util/redis";
// import * as sanitizeHtml from "sanitize-html";
const sanitizeHtml = require("sanitize-html");

interface MulterRequest extends Request {
  file: multer.File;
}

export class UniProgramsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      console.log("currentUser id uniprograms :>> ", id);
      const {
        nameOfInstitution,
        titleOfProgramme,
        qualificationType,
        qualification,
        discipline,
        studyType,
        startTerm,
        location,
        language,
        delivery,
        duration,
        aboutCourse,
        courseContent,
        entryRequirements,
        homeFees,
        internationalFees,
        scholarship,
        accommodationDetails,
        accreditationDetails,
        university,
        howToApply,
        openDays,
        careerPaths,
        registerInterest,
        applyLink,
      } = req.body;

      let model: any = {
        author: id,
        nameOfInstitution,
        titleOfProgramme,
        qualificationType,
        qualification,
        discipline,
        studyType,
        startTerm,
        location,
        language,
        delivery,
        duration,
        aboutCourse: sanitizeHtml(aboutCourse),
        courseContent,
        // courseContent:sanitizeHtml(courseContent),
        entryRequirements: sanitizeHtml(entryRequirements),
        howToApply: sanitizeHtml(howToApply),
        fees: {
          home: homeFees,
          international: internationalFees,
        },
        scholarship,
        accommodationDetails: sanitizeHtml(accommodationDetails),
        accreditationDetails: sanitizeHtml(accreditationDetails),
        university,
        openDays: openDays.split(","),
        careerPaths: careerPaths.split(","),
        registerInterest,
        applyLink,
      };
      // If an image is uploaded, store its path
      if (req.file) {
        model.image = `${req.file.fieldname}${req.file.filename}`;
        console.log(" model.image :>> ", model.image);
      }

      console.log("req.file :>> ", req.file);
      // console.log('model :>> ', model);

      console.log("model :>> ", model);
      const newModel = new UniProgramModel(model);
      await newModel.save();

      res
        .status(201)
        .json({message: "Program added successfully", response: newModel});
    } catch (error) {
      console.log("error :>> ", error);
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        nameOfInstitution,
        titleOfProgramme,
        qualificationType,
        qualification,
        discipline,
        studyType,
        startTerm,
        location,
        language,
        delivery,
        duration,
        aboutCourse,
        courseContent,
        entryRequirements,
        homeFees,
        internationalFees,
        scholarship,
        accommodationDetails,
        university,
        accreditationDetails,
        howToApply,
        openDays,
        careerPaths,
        registerInterest,
        applyLink,
      } = req.body;

      // Find the existing document by ID (passed in the route params)
      const existingModel = await UniProgramModel.findById(req.params.id);

      if (!existingModel) {
        return res.status(404).json({error: "Program not found"});
      }

      // Update the model with new data
      existingModel.nameOfInstitution =
        nameOfInstitution || existingModel.nameOfInstitution;
      existingModel.titleOfProgramme =
        titleOfProgramme || existingModel.titleOfProgramme;
      existingModel.qualificationType =
        qualificationType || existingModel.qualificationType;
      existingModel.qualification =
        qualification || existingModel.qualification;
      existingModel.discipline = discipline || existingModel.discipline;
      existingModel.studyType = studyType || existingModel.studyType;
      existingModel.startTerm = startTerm || existingModel.startTerm;
      existingModel.location = location || existingModel.location;
      existingModel.language = language || existingModel.language;
      existingModel.delivery = delivery || existingModel.delivery;
      existingModel.duration = duration || existingModel.duration;
      existingModel.aboutCourse = aboutCourse || existingModel.aboutCourse;
      existingModel.courseContent =
        courseContent || existingModel.courseContent;
      existingModel.entryRequirements =
        entryRequirements || existingModel.entryRequirements;
      existingModel.fees = {
        home: homeFees || existingModel.fees.home,
        international: internationalFees || existingModel.fees.international,
      };
      existingModel.scholarship = scholarship || existingModel.scholarship;
      existingModel.accommodationDetails =
        accommodationDetails || existingModel.accommodationDetails;
      existingModel.university = university || existingModel.university;

      existingModel.accreditationDetails =
        accreditationDetails || existingModel.accreditationDetails;
      existingModel.howToApply = howToApply || existingModel.howToApply;
      existingModel.careerPaths =
        careerPaths.split(",") || existingModel.careerPaths;

      existingModel.openDays = openDays.split(",") || existingModel.openDays;
      existingModel.registerInterest =
        registerInterest || existingModel.registerInterest;
      existingModel.applyLink = applyLink || existingModel.applyLink;
      // If an image is uploaded, store its path
      if (req.file) {
        existingModel.image =
          `${req.file.fieldname}${req.file.filename}` || existingModel.image;
        console.log(" existingModel.image :>> ", existingModel.image);
      }

      // Save the updated model
      const updatedModel = await existingModel.save();

      let key = "/university-programs/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);

      res.status(200).json({
        message: "Program updated successfully",
        response: updatedModel,
      });
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the program by ID (passed in the route params)
      const program = await UniProgramModel.findById(req.params.id);

      if (!program) {
        return res.status(404).json({error: "Program not found"});
      }

      // If an image is uploaded, update the program with the new image path
      if (req.file) {
        program.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        let response = await program.save(); // Save the updated program

        res
          .status(201)
          .json({message: "Program image updated successfully", response});
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

      const model = await UniProgramModel.findById(req.params.id);

      if (!model) {
        return res.status(404).json({error: "Program not found"});
      }

      // Cache the result for 1 hour (3600 seconds)
      await redis.setEx(key, 3600, JSON.stringify(model));
      res.status(200).json({message: "Program found", response: model});
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

        const models = await UniProgramModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Program found", response: models});
      } else {
        const key = req.originalUrl;
        // Check cache first
        const cachedData = await redis.get(key);
        if (cachedData) {
          console.log("✅ Returning cached data");
          return res.json({message: "Data found", response: JSON.parse(cachedData)});
        }

        const models = await UniProgramModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Program found", response: models});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getByUniversity(req: Request, res: Response) {
    try {
      // Find programs by university ID (passed in the route params)
      const programs = await UniProgramModel.find({university: req.params.id});

      if (programs.length === 0) {
        return res
          .status(404)
          .json({error: "No programs found for this university"});
      }

      res.status(200).json({message: "Program found", response: programs});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the program by ID (passed in the route params)
      const program = await UniProgramModel.findByIdAndDelete(req.params.id);

      if (!program) {
        return res.status(404).json({error: "Program not found"});
      }

      let key = "/university-programs/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res.status(200).json({message: "Program successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the program by ID and update its status to 'DELETED'
      const program = await UniProgramModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!program) {
        return res.status(404).json({error: "Program not found"});
      }

      res
        .status(200)
        .json({message: "Program status updated to DELETED", program});
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

        const models = await UniProgramModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Program found", response: models});
      
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({error: error.message});
    }
  }
}
