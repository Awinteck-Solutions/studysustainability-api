import {Request, Response} from "express";
import * as multer from "multer";
import EventsModel from "../schema/events.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";

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
        eventData.image = `${req.file.fieldname}/${req.file.filename}`;
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
          `${req.file.fieldname}/${req.file.filename}` || existingEvent.image;
        console.log(" existingModel.image :>> ", existingEvent.image);
      }

      // Save the updated Event model
      const updatedEvent = await existingEvent.save();
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
        event.image = `${req.file.fieldname}/${req.file.filename}`; // Update image field with new image path
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
      const event = await EventsModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      res.status(200).json({message: "Event found", response: event});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const {id, role} = req["currentUser"];
      if (role == Roles.ADMIN) {
        const models = await EventsModel.find({
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

          console.log('models :>> ', models);
        res.status(200).json({message: "Events Data found", response: models});
      } else {
        const models = await EventsModel.find({
          author: new mongoose.Types.ObjectId(id),
          status: {$ne: "DELETED"},
        }).sort({createdAt: -1});

        console.log('models 2:>> ', models);
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
}
