import {Request, Response} from "express";
import UniProgramModel from "../schema/uniprograms.schema";
import * as multer from "multer";
import {Roles} from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
// import * as sanitizeHtml from "sanitize-html";
const sanitizeHtml = require("sanitize-html");

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
        openDays: openDays ? openDays.split(",") : [],
        careerPaths:  careerPaths ? careerPaths.split(",") : [],
        registerInterest,
        applyLink,
      };
      // If an image is uploaded, store its path
      if (req.file) {
        // model.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "uniprograms");
        if (result) {
          model.image = `${result.Key}`;
        }
      }

      console.log("req.file :>> ", req.file);
      // console.log('model :>> ', model);

      console.log("model :>> ", model);
      const newModel = new UniProgramModel(model);
      await newModel.save();

      // Invalidate cache after creating new program
      await invalidateCache('UNI_PROGRAMS');

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
        // existingModel.image =
        //   `${req.file.fieldname}${req.file.filename}` || existingModel.image;
        const result = await uploadFile(req.file, "uniprograms");
        if (result) {
          existingModel.image = `${result.Key}`;
        }
      }

      // Save the updated model
      const updatedModel = await existingModel.save();

      // Invalidate cache after updating program
      await invalidateCache('UNI_PROGRAMS', req.params.id);

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
        // program.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "uniprograms");
        if (result) {
          program.image = `${result.Key}`;
        }
        let response = await program.save(); // Save the updated program

        // Invalidate cache after updating image
        await invalidateCache('UNI_PROGRAMS', req.params.id);

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
      const key = CACHE_KEYS.UNI_PROGRAMS.BY_ID(req.params.id);
      // Check cache first
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({message: "Data found", response: cachedData});
      }

      const model = await UniProgramModel.findById(req.params.id);

      if (!model) {
        return res.status(404).json({error: "Program not found"});
      }

      // Cache the result for 1 hour
      await setCachedData(key, model, CACHE_DURATION.MEDIUM);
      res.status(200).json({message: "Program found", response: model});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const key = CACHE_KEYS.UNI_PROGRAMS.ALL;
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await UniProgramModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
        res.status(200).json({message: "Program found", response: models});
      } else {
        const key = getUserCacheKey(CACHE_KEYS.UNI_PROGRAMS.ALL, id);
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({message: "Data found", response: cachedData});
        }

        const models = await UniProgramModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        // Cache the result for 1 hour
        await setCachedData(key, models, CACHE_DURATION.MEDIUM);
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

      // Invalidate cache after permanent deletion
      await invalidateCache('UNI_PROGRAMS', req.params.id);
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

      // Invalidate cache after soft deletion
      await invalidateCache('UNI_PROGRAMS', req.params.id);

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
    
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const key = CACHE_KEYS.UNI_PROGRAMS.PUBLIC(page, limit);
        // Check cache first
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          UniProgramModel.find({ status: "ACTIVE" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          UniProgramModel.countDocuments({ status: "ACTIVE" })
        ]);
      const totalPages = Math.ceil(total / limit);
      
      const responsePayload = {
        message: "Data found",
        metadata: {
          total,
          page,
          limit,
          totalPages,
        },
        response: models,
      };

        // Cache the result for 1 hour
        await setCachedData(key, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({error: error.message});
    }
  }
}
