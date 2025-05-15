import {Request, Response} from "express";
import * as multer from "multer";
import EventsModel from "../schema/events.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import redis from "../../../util/redis";

interface MulterRequest extends Request {
  file: multer.File;
}

export class EventsController {
  static async create(req: MulterRequest, res: Response) {
    try {
      const {id} = req["currentUser"];
      const {
        organiser,
        nameOfProvider,
        titleOfEvent,
        eventType,
        details,
        duration,
        startDates,
        endDates,
        speakers,
        fees,
        paymentOptions,
        deliveryFormat,
        registrationLink,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        language,
        applyLink,
        howToApply,
      } = req.body;

      let eventData: any = {
        author: id,
        organiser,
        nameOfProvider,
        titleOfEvent,
        eventType,
        details,
        duration,
        startDates,
        endDates,
        speakers,
        fees,
        paymentOptions,
        deliveryFormat,
        registrationLink,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        language,
        applyLink,
        howToApply,
      };

      // If an image is uploaded, store its path
      if (req.file) {
        eventData.image = `${req.file.fieldname}${req.file.filename}`;
        console.log("req.file.path :>> ", req.file.path);
      }

      // Create a new Event model and save it
      const newEvent = new EventsModel(eventData);
      await newEvent.save();

      res
        .status(201)
        .json({message: "Event created successfully", response: newEvent});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async update(req: MulterRequest, res: Response) {
    try {
      const {
        organiser,
        nameOfProvider,
        titleOfEvent,
        eventType,
        details,
        duration,
        startDates,
        endDates,
        speakers,
        fees,
        paymentOptions,
        deliveryFormat,
        registrationLink,
        deadline,
        summary,
        benefits,
        eligibility,
        application,
        moreInfoLink,
        language,
        applyLink,
        howToApply,
      } = req.body;

      // Find the existing Event document by ID (passed in the route params)
      const existingEvent = await EventsModel.findById(req.params.id);

      if (!existingEvent) {
        return res.status(404).json({error: "Event not found"});
      }

      // Update the event with new data
      existingEvent.organiser = organiser || existingEvent.organiser;
      existingEvent.nameOfProvider =
        nameOfProvider || existingEvent.nameOfProvider;
      existingEvent.titleOfEvent = titleOfEvent || existingEvent.titleOfEvent;
      existingEvent.eventType = eventType || existingEvent.eventType;
      existingEvent.details = details || existingEvent.details;
      existingEvent.duration = duration || existingEvent.duration;
      existingEvent.startDates = startDates || existingEvent.startDates;
      existingEvent.endDates = endDates || existingEvent.endDates;
      existingEvent.speakers = speakers || existingEvent.speakers;
      existingEvent.fees = fees || existingEvent.fees;
      existingEvent.paymentOptions =
        paymentOptions || existingEvent.paymentOptions;
      existingEvent.deliveryFormat =
        deliveryFormat || existingEvent.deliveryFormat;
      existingEvent.registrationLink =
        registrationLink || existingEvent.registrationLink;
      existingEvent.deadline = deadline || existingEvent.deadline;
      existingEvent.summary = summary || existingEvent.summary;
      existingEvent.benefits = benefits || existingEvent.benefits;
      existingEvent.eligibility = eligibility || existingEvent.eligibility;
      existingEvent.application = application || existingEvent.application;
      existingEvent.moreInfoLink = moreInfoLink || existingEvent.moreInfoLink;
      existingEvent.language = language || existingEvent.language;
      existingEvent.applyLink = applyLink || existingEvent.applyLink;
      existingEvent.howToApply = howToApply || existingEvent.howToApply;
      if (req.file) {
        existingEvent.image =
          `${req.file.fieldname}${req.file.filename}` || existingEvent.image;
        console.log(" existingModel.image :>> ", existingEvent.image);
      }

      // Save the updated Event model
      const updatedEvent = await existingEvent.save();

      let key = "/events/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);

      res.status(200).json({message: "Event updated", response: updatedEvent});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async updateImage(req: MulterRequest, res: Response) {
    try {
      // Find the Event model by ID (passed in the route params)
      const event = await EventsModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      // If an image is uploaded, update the model with the new image path
      if (req.file) {
        event.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        await event.save(); // Save the updated model
        res
          .status(201)
          .json({message: "Event image updated successfully", response: event});
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
      //   return res.json({message: "Data found", response: JSON.parse(cachedData)});
      // }

      const event = await EventsModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      // await redis.setEx(key, 3600, JSON.stringify(event));

      res.status(200).json({message: "Event found", response: event});
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

        const models = await EventsModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        console.log("models :>> ", models);

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Events Data found", response: models});
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

        const models = await EventsModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        console.log("models 2:>> ", models);

        // Cache the result for 1 hour (3600 seconds)
        await redis.setEx(key, 3600, JSON.stringify(models));
        res.status(200).json({message: "Events Data found", response: models});
      }
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the Event model by ID and update its status to 'DELETED'
      const event = await EventsModel.findByIdAndUpdate(
        req.params.id,
        {status: "DELETED"}, // Update status field
        {new: true} // Return the updated document
      );

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      let key = "/events/";
      redis.del(key);
      redis.del(`${key}${req.params.id}`);
      res.status(200).json({message: "Event status updated to DELETED", event});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the Event model by ID and delete it permanently
      const event = await EventsModel.findByIdAndDelete(req.params.id);

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      res.status(200).json({message: "Event successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  // PUBLIC ENDPOINT
  // static async getAllPublic(req: Request, res: Response) {
  //   try {
  //     const page = parseInt(req.query.page as string) || 1;
  //     const limit = parseInt(req.query.limit as string) || 10;
  //     const skip = (page - 1) * limit;
  //     const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;

  //     // Check cache first
  //     // const cachedData = await redis.get(key);
  //     // if (cachedData) {
  //     //   console.log("✅ Returning cached data");
  //     //   return res.json(JSON.parse(cachedData));
  //     // }

  //     const [models, total] = await Promise.all([
  //       EventsModel.find({ status: { $ne: "DELETED" } })
  //         .sort({ createdAt: -1 })
  //         .skip(skip)
  //         .limit(limit),
  //       EventsModel.countDocuments({ status: { $ne: "DELETED" } }),
  //     ]);

  //     const result = {
  //       message: "Data found",
  //       response: models,
  //       pagination: {
  //         total,
  //         page,
  //         limit,
  //         totalPages: Math.ceil(total / limit),
  //       },
  //     };

  //     // Cache the result for 1 hour (3600 seconds)
  //     // await redis.setEx(key, 3600, JSON.stringify(result));
  //     res.status(200).json(result);

  //   } catch (error: any) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }

  static async getAllPublic(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const key = `${req.baseUrl}${req.path}?page=${page}&limit=${limit}`;

      const {search, eventType, deliveryFormat, fees} = req.query;

      const filter: any = {
        status: {$ne: "DELETED"},
      };

      // Search
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        filter.$or = [
          {nameOfProvider: searchRegex},
          {titleOfEvent: searchRegex},
          {summary: searchRegex},
        ];
      }

      // Filters
      if (eventType) {
        filter.eventType = eventType;
      }

      if (deliveryFormat) {
        filter.deliveryFormat = deliveryFormat;
      }

      if (fees) {
        if (fees === "free") {
          filter.fees = 0 || '';
        } else if (fees === "paid") {
          filter.fees = {$gt: 0};
        }
      }

      // Deadline filter: only events with upcoming deadlines
      filter.deadline = {$gte: new Date()};

      // Check cache first
      // const cachedData = await redis.get(key);
      // if (cachedData) {
      //   console.log("✅ Returning cached data");
      //   return res.json(JSON.parse(cachedData));
      // }

      const [models, total] = await Promise.all([
        EventsModel.find(filter).sort({createdAt: -1}).skip(skip).limit(limit),
        EventsModel.countDocuments(filter),
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
    } catch (error: any) {
      res.status(400).json({error: error.message});
    }
  }
}
