import { Request, Response } from "express";
import SubscriberModel from "../schema/subscriber.schema";
import { Roles } from "../../AUTH/enums/roles.enum";
import { CACHE_KEYS, CACHE_DURATION, invalidateCache, getCachedData, setCachedData, getUserCacheKey } from "../../../util/redis-helper";

export class SubscriberController {
  static async create(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Check if email already exists
      const existingSubscriber = await SubscriberModel.findOne({ email });
      if (existingSubscriber) {
        return res.status(400).json({ error: "Email already subscribed" });
      }

      const newSubscriber = new SubscriberModel({ email });
      await newSubscriber.save();

      // Invalidate cache after creating new subscriber
      await invalidateCache('SUBSCRIBERS');

      res
        .status(201)
        .json({ message: "Subscriber created successfully", response: newSubscriber });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { email } = req.body;

      // Find the existing subscriber by ID
      const existingSubscriber = await SubscriberModel.findById(req.params.id);

      if (!existingSubscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      // Check if email already exists for another subscriber
      if (email && email !== existingSubscriber.email) {
        const emailExists = await SubscriberModel.findOne({ 
          email, 
          _id: { $ne: req.params.id } 
        });
        if (emailExists) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Update the subscriber with new data
      existingSubscriber.email = email || existingSubscriber.email;

      // Save the updated subscriber
      const updatedSubscriber = await existingSubscriber.save();
      
      // Invalidate cache after updating subscriber
      await invalidateCache('SUBSCRIBERS', req.params.id);
      res
        .status(200)
        .json({ message: "Subscriber updated successfully", response: updatedSubscriber });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const key = CACHE_KEYS.SUBSCRIBERS?.BY_ID?.(req.params.id);
      // Check cache first if cache keys exist
      if (key) {
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({ message: "Data found", response: cachedData });
        }
      }

      const subscriber = await SubscriberModel.findById(req.params.id);

      if (!subscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      // Cache the result for 1 hour if cache keys exist
      if (key) {
        await setCachedData(key, subscriber, CACHE_DURATION.MEDIUM);
      }
      res.status(200).json({ message: "Subscriber found", response: subscriber });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try { 
      
      const key = CACHE_KEYS.SUBSCRIBERS?.ALL;
      // Check cache first if cache keys exist
      if (key) {
        const cachedData = await getCachedData(key);
        if (cachedData) {
          return res.json({ message: "Data found", response: cachedData });
        }
      }

      const subscribers = await SubscriberModel.find({
        status: { $ne: "DELETED" },
      }).sort({ createdAt: -1 });

      // Cache the result for 1 hour if cache keys exist
      if (key) {
        await setCachedData(key, subscribers, CACHE_DURATION.MEDIUM);
      }
      res.status(200).json({ message: "Data found", response: subscribers });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      // Find the subscriber by ID and update its status to 'DELETED'
      const subscriber = await SubscriberModel.findByIdAndUpdate(
        req.params.id,
        { status: "DELETED" }, // Update status field
        { new: true } // Return the updated document
      );

      if (!subscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      // Invalidate cache after soft deletion
      await invalidateCache('SUBSCRIBERS', req.params.id);

      res
        .status(200)
        .json({ message: "Subscriber status updated to DELETED", response: subscriber });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async permanentDelete(req: Request, res: Response) {
    try {
      // Find the subscriber by ID (passed in the route params) and delete it permanently
      const subscriber = await SubscriberModel.findByIdAndDelete(req.params.id);

      if (!subscriber) {
        return res.status(404).json({ error: "Subscriber not found" });
      }

      // Invalidate cache after permanent deletion
      await invalidateCache('SUBSCRIBERS', req.params.id);

      res.status(200).json({ message: "Subscriber successfully deleted" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Public endpoint for subscribing
  static async subscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if email already exists
      const existingSubscriber = await SubscriberModel.findOne({ email });
      if (existingSubscriber) {
        if (existingSubscriber.status === "DELETED") {
          // Reactivate the subscriber
          existingSubscriber.status = "ACTIVE";
          existingSubscriber.subscribedAt = new Date();
          await existingSubscriber.save();
          
          await invalidateCache('SUBSCRIBERS');
          return res.status(200).json({ 
            message: "Email resubscribed successfully", 
            response: existingSubscriber 
          });
        }
        return res.status(400).json({ error: "Email already subscribed" });
      }

      const newSubscriber = new SubscriberModel({ email });
      await newSubscriber.save();

      // Invalidate cache after creating new subscriber
      await invalidateCache('SUBSCRIBERS');

      res
        .status(201)
        .json({ message: "Successfully subscribed", response: newSubscriber });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Public endpoint for unsubscribing
  static async unsubscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const subscriber = await SubscriberModel.findOne({ email });
      if (!subscriber) {
        return res.status(404).json({ error: "Email not found in subscribers" });
      }

      // Update status to DELETED
      subscriber.status = "DELETED";
      await subscriber.save();

      // Invalidate cache after unsubscribing
      await invalidateCache('SUBSCRIBERS');

      res.status(200).json({ message: "Successfully unsubscribed" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
