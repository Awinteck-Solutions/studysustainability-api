import {Request, Response} from "express";
import * as multer from "multer";
import EventsModel from "../schema/events.schema";
import mongoose from "mongoose";
import {Roles} from "../../AUTH/enums/roles.enum";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";
import { uploadFile } from "../../../util/s3";
import Engagement from "../../Engagement/schema/Engagement.schema";
import InterestForm from "../../INTERESTFORM/schema/InterestForm.schema";

interface MulterRequest extends Request {
  file?: multer.File;
  files?: multer.File[];
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
        deadline: deadline && deadline !== "null" ? new Date(deadline) : null,
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
        // eventData.image = `${req.file.fieldname}${req.file.filename}`;
        const result = await uploadFile(req.file, "events");
        if (result) {
          eventData.image = `${result.Key}`;
        }
      }

      // Create a new Event model and save it
      const newEvent = new EventsModel(eventData);
      await newEvent.save();

      // Invalidate cache after creating new event
      await invalidateCache('EVENTS');
      await invalidateCache('ANALYTICS');

      res
        .status(201)
        .json({message: "Event created successfully", response: newEvent});
    } catch (error) {
      console.log('error', error)
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
        status,
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
      existingEvent.deadline = deadline && deadline !== "null" ? new Date(deadline) : existingEvent.deadline;
      existingEvent.summary = summary || existingEvent.summary;
      existingEvent.benefits = benefits || existingEvent.benefits;
      existingEvent.eligibility = eligibility || existingEvent.eligibility;
      existingEvent.application = application || existingEvent.application;
      existingEvent.moreInfoLink = moreInfoLink || existingEvent.moreInfoLink;
      existingEvent.language = language || existingEvent.language;
      existingEvent.applyLink = applyLink || existingEvent.applyLink;
      existingEvent.howToApply = howToApply || existingEvent.howToApply;
      existingEvent.status = status || existingEvent.status;
      if (req.file) {
        // existingEvent.image =
        //   `${req.file.fieldname}${req.file.filename}` || existingEvent.image;
        const result = await uploadFile(req.file, "events");
        if (result) {
          existingEvent.image = `${result.Key}`;
        }
      }

      // Save the updated Event model
      const updatedEvent = await existingEvent.save();

      // Invalidate cache after updating event
      await invalidateCache('EVENTS', req.params.id);
      await invalidateCache('ANALYTICS');

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
        // event.image = `${req.file.fieldname}${req.file.filename}`; // Update image field with new image path
        const result = await uploadFile(req.file, "events");
        if (result) {
          event.image = `${result.Key}`;
        }
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
      const key = CACHE_KEYS.EVENTS.BY_ID(req.params.id);
      const cachedData = await getCachedData(key);
      if (cachedData) {
        return res.json({message: "Data found", response: cachedData});
      }


      const event = await EventsModel.findById(req.params.id);

      if (!event) {
        return res.status(404).json({error: "Event not found"});
      }

      await setCachedData(key, event, CACHE_DURATION.MEDIUM);

      res.status(200).json({message: "Event found", response: event});
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
        const cacheKey = `events_admin_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          EventsModel.find({
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          EventsModel.countDocuments({status: {$ne: "DELETED"}})
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          message: "Events Data found",
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
        const cacheKey = `events_user_${id}_${page}_${limit}`;
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        const [models, total] = await Promise.all([
          EventsModel.find({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"},
          }).sort({createdAt: -1}).skip(skip).limit(limit),
          EventsModel.countDocuments({
            author: new mongoose.Types.ObjectId(id),
            status: {$ne: "DELETED"}
          })
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          message: "Events Data found",
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

      // Invalidate cache after soft deletion
      await invalidateCache('EVENTS', req.params.id);
      await invalidateCache('ANALYTICS');
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

      // Invalidate cache after permanent deletion
      await invalidateCache('EVENTS', req.params.id);

      res.status(200).json({message: "Event successfully deleted"});
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }


// PUBLIC ENDPOINT
static async getAllPublic(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Extract search and filter parameters
    const search = req.query.search as string;
    const eventType = req.query.eventType as string;
    const nameOfProvider = req.query.nameOfProvider as string;
    const deliveryFormat = req.query.deliveryFormat as string;
    const language = req.query.language as string;
    const includeExpired = req.query.includeExpired as string;

    // Build the base query
    let query: any = { status: "ACTIVE" };

    // Add search functionality (searches across event title, provider, and details)
    if (search) {
      query.$or = [
        { titleOfEvent: { $regex: search, $options: 'i' } },
        { nameOfProvider: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    // Add filter parameters
    if (eventType) {
      query.eventType = { $regex: eventType, $options: 'i' };
    }

    if (nameOfProvider) {
      query.nameOfProvider = { $regex: nameOfProvider, $options: 'i' };
    }

    if (deliveryFormat) {
      query.deliveryFormat = { $regex: deliveryFormat, $options: 'i' };
    }

    if (language) {
      query.language = { $regex: language, $options: 'i' };
    }

    // Filter out expired deadlines unless explicitly requested
    if (includeExpired !== 'true') {
      query.$and = [
        {
          $or: [
            { deadline: { $exists: false } },
            { deadline: null },
            { deadline: { $gte: new Date() } }
          ]
        }
      ];
    }

    // Create cache key that includes search and filter parameters
    const cacheKey = `events_public_${page}_${limit}_${search || ''}_${eventType || ''}_${nameOfProvider || ''}_${deliveryFormat || ''}_${language || ''}_${includeExpired || ''}`;
    
    // Check cache first
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const [models, total] = await Promise.all([
      EventsModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EventsModel.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    const responsePayload = {
      message: "Events Data found",
      metadata: {
        total,
        page,
        limit,
        totalPages,
        filters: {
          search: search || null,
          eventType: eventType || null,
          nameOfProvider: nameOfProvider || null,
          deliveryFormat: deliveryFormat || null,
          language: language || null,
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

static async getEventsDashboardMetrics(req: Request, res: Response) {
  try {
    const organiserUserId = req["currentUser"].id;

    if (!organiserUserId) {
      return res.status(400).json({
        success: false,
        message: "Organiser user ID is required",
      });
    }

    const organiserObjectId = new mongoose.Types.ObjectId(organiserUserId);

    // 1️⃣ Total events & active events
    const [totalEvents, totalActiveEvents] = await Promise.all([
      EventsModel.countDocuments({organiser: organiserObjectId, status: {$ne: "DELETED"}}),
      EventsModel.countDocuments({
        organiser: organiserObjectId,
        status: "ACTIVE",
      }),
    ]);

    // 2️⃣ Get all event _ids for this organiser
    const eventIds = await EventsModel.find(
      {organiser: organiserObjectId},
      {_id: 1}
    ).lean();

    const eventIdList = eventIds.map((e) => e._id);

    // 3️⃣ Total registered interests
    const totalRegisteredInterests = await InterestForm.countDocuments({
      menuId: {$in: eventIdList},
      menu: "Events",
    });

    // 4️⃣ Total views from Engagement (type: VIEW)
    const engagementAggregation = await Engagement.aggregate([
      {
        $match: {
          item: {$in: eventIdList},
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
      message: "Events dashboard metrics fetched successfully",
      response: {
        totalEvents,
        totalActiveEvents,
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

    const event = await EventsModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Invalidate analytics cache
    await invalidateCache('ANALYTICS');
    // invalidate cache for the event
    invalidateCache('EVENTS', id);

    return res.status(200).json({
      success: true,
      message: "Event status updated successfully",
      response: event,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "System error",
    });
  }
}

// GET EVENTS STATISTICS
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

    const cacheKey = 'events_stats';
    
    // Check cache first
    const cachedData = await getCachedData(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get statistics
    const [
      totalEvents,
      activeEvents,
      inactiveEvents, 
      eventTypeStats,
      providerStats,
      recentEvents,
      totalEnrolled,
      totalEngagements
    ] = await Promise.all([
      EventsModel.countDocuments({  status: { $ne: "DELETED" }}),
      EventsModel.countDocuments({ status: "ACTIVE" }),
      EventsModel.countDocuments({ status: "INACTIVE" }), 
      EventsModel.aggregate([
        { $match: { status: { $ne: "DELETED" } } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EventsModel.aggregate([
        { $match: { status: { $ne: "DELETED" } } },
        { $group: { _id: "$nameOfProvider", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      EventsModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { $ne: "DELETED" }
      }),
      InterestForm.countDocuments({ status: "ACTIVE", menu: 'Events'}),
      Engagement.countDocuments({ itemType: 'EVENTS'})
    ]);

    const stats = {
      totalEvents,
      activeEvents,
      inactiveEvents,
      eventTypeBreakdown: eventTypeStats.map(stat => ({
        eventType: stat._id,
        count: stat.count
      })),
      providerBreakdown: providerStats.map(stat => ({
        provider: stat._id,
        count: stat.count
      })),
      recentEvents, // Events created in last 7 days
      statusBreakdown: {
        active: activeEvents,
        inactive: inactiveEvents,
      },
      // Additional platform statistics
      totalEnrolled, // Total active interest form submissions
      totalEngagements // Total engagement records
    };

    const responsePayload = {
      status: true,
      message: "Events statistics retrieved successfully",
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