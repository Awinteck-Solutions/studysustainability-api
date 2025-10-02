import { Request, Response } from "express";
import EmailerModel from "../schema/emailer.schema";
import { CreateEmailerDto, UpdateEmailerDto, SendEmailDto, BulkEmailDto } from "../dto/emailer.dto";
import { getCachedData, setCachedData, invalidateCache, CACHE_DURATION, CACHE_KEYS } from "../../../util/redis-helper";
import { Roles } from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";

// Mock email service integration - replace with actual email service SDK
const sendEmailViaService = async (emailData: any, service: string): Promise<any> => {
  // This is a mock implementation - replace with actual email service API calls
  console.log(`Sending email via ${service}:`, emailData);
  
  return {
    messageId: `msg_${Date.now()}`,
    campaignId: `camp_${Date.now()}`,
    status: "SENT"
  };
};

const sendBulkEmail = async (emails: string[], emailData: any, service: string): Promise<any> => {
  // Mock implementation for bulk email sending
  console.log(`Sending bulk email to ${emails.length} recipients via ${service}:`, emailData);
  
  return {
    messageId: `bulk_msg_${Date.now()}`,
    campaignId: `bulk_camp_${Date.now()}`,
    status: "SENT",
    sentCount: emails.length
  };
};

export class EmailerController {
  // Create new email campaign
  static async create(req: Request, res: Response) {
    try {
      const { id } = req["currentUser"];
      const campaignData: CreateEmailerDto = req.body;

      // Create the email campaign
      const campaign = new EmailerModel({
        ...campaignData,
        author: new mongoose.Types.ObjectId(id)
      });

      await campaign.save();

      // Invalidate cache
      await invalidateCache('EMAILER');

      res.status(201).json({
        success: true,
        message: "Email campaign created successfully",
        response: campaign
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get all email campaigns with pagination
  static async getAll(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract filter parameters
      const status = req.query.status as string;
      const emailService = req.query.emailService as string;
      const search = req.query.search as string;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination and filters
        const cacheKey = `emailer_admin_${page}_${limit}_${status || ''}_${emailService || ''}_${search || ''}`;
        
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        // Build query
        let query: any = { status: { $ne: "DELETED" } };

        if (status) {
          query.status = status;
        }

        if (emailService) {
          query.emailService = emailService;
        }

        if (search) {
          query.$or = [
            { campaignName: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { fromEmail: { $regex: search, $options: 'i' } }
          ];
        }

        const [campaigns, total] = await Promise.all([
          EmailerModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          EmailerModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          success: true,
          message: "Email campaigns retrieved successfully",
          metadata: {
            total,
            page,
            limit,
            totalPages,
            filters: {
              status: status || null,
              emailService: emailService || null,
              search: search || null
            }
          },
          response: campaigns
        };

        // Cache the result
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // User-specific campaigns
        const cacheKey = `emailer_user_${id}_${page}_${limit}_${status || ''}_${emailService || ''}_${search || ''}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        let query: any = {
          author: new mongoose.Types.ObjectId(id),
          status: { $ne: "DELETED" }
        };

        if (status) {
          query.status = status;
        }

        if (emailService) {
          query.emailService = emailService;
        }

        if (search) {
          query.$or = [
            { campaignName: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { fromEmail: { $regex: search, $options: 'i' } }
          ];
        }

        const [campaigns, total] = await Promise.all([
          EmailerModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          EmailerModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          success: true,
          message: "Email campaigns retrieved successfully",
          metadata: {
            total,
            page,
            limit,
            totalPages,
            filters: {
              status: status || null,
              emailService: emailService || null,
              search: search || null
            }
          },
          response: campaigns
        };

        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      }
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get single email campaign
  static async getOne(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const campaignId = req.params.id;

      let query: any = { _id: campaignId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const campaign = await EmailerModel.findOne(query);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Email campaign retrieved successfully",
        response: campaign
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update email campaign
  static async update(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const campaignId = req.params.id;
      const updateData: UpdateEmailerDto = req.body;

      let query: any = { _id: campaignId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const campaign = await EmailerModel.findOneAndUpdate(
        query,
        updateData,
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }

      // Invalidate cache
      await invalidateCache('EMAILER');

      res.status(200).json({
        success: true,
        message: "Email campaign updated successfully",
        response: campaign
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete email campaign (soft delete)
  static async delete(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const campaignId = req.params.id;

      let query: any = { _id: campaignId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const campaign = await EmailerModel.findOneAndUpdate(
        query,
        { status: "DELETED" },
        { new: true }
      );

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }

      // Invalidate cache
      await invalidateCache('EMAILER');

      res.status(200).json({
        success: true,
        message: "Email campaign deleted successfully",
        response: campaign
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Send email campaign
  static async sendCampaign(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const { campaignId, recipients, scheduleType, scheduledAt }: SendEmailDto = req.body;

      let query: any = { _id: campaignId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const campaign = await EmailerModel.findOne(query);

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }

      if (campaign.status === "SENT") {
        return res.status(400).json({
          success: false,
          message: "Campaign has already been sent"
        });
      }

      // Update recipients if provided
      if (recipients && recipients.length > 0) {
        // Clear existing recipients and add new ones
        campaign.recipients.splice(0, campaign.recipients.length);
        recipients.forEach(recipient => {
          campaign.recipients.push({
            email: recipient.email,
            name: recipient.name,
            status: recipient.status || "PENDING"
          });
        });
        campaign.totalRecipients = recipients.length;
      }

      // Update schedule if provided
      if (scheduleType) {
        campaign.scheduleType = scheduleType;
        if (scheduledAt) {
          campaign.scheduledAt = new Date(scheduledAt);
        }
      }

      // Send immediately if scheduleType is IMMEDIATE
      if (scheduleType === "IMMEDIATE" || campaign.scheduleType === "IMMEDIATE") {
        campaign.status = "SENDING";
        await campaign.save();

        try {
          // Send emails via email service
          const emailData = {
            subject: campaign.subject,
            htmlContent: campaign.htmlContent,
            textContent: campaign.textContent,
            fromName: campaign.fromName,
            fromEmail: campaign.fromEmail,
            replyToEmail: campaign.replyToEmail,
            recipients: campaign.recipients
          };

          const result = await sendEmailViaService(emailData, campaign.emailService);

          // Update campaign with service response
          campaign.serviceCampaignId = result.campaignId;
          campaign.serviceMessageId = result.messageId;
          campaign.status = "SENT";
          campaign.totalSent = campaign.recipients.length;

          // Update recipient statuses
          campaign.recipients.forEach(recipient => {
            recipient.status = "SENT";
            recipient.sentAt = new Date();
          });

          await campaign.save();

          res.status(200).json({
            success: true,
            message: "Email campaign sent successfully",
            response: {
              campaignId: campaign._id,
              serviceCampaignId: result.campaignId,
              totalSent: campaign.totalSent,
              status: campaign.status
            }
          });
        } catch (sendError) {
          campaign.status = "FAILED";
          await campaign.save();

          res.status(500).json({
            success: false,
            message: "Failed to send email campaign",
            error: sendError.message
          });
        }
      } else {
        // Schedule for later
        campaign.status = "SCHEDULED";
        await campaign.save();

        res.status(200).json({
          success: true,
          message: "Email campaign scheduled successfully",
          response: {
            campaignId: campaign._id,
            scheduledAt: campaign.scheduledAt,
            status: campaign.status
          }
        });
      }

      // Invalidate cache
      await invalidateCache('EMAILER');
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Send bulk email
  static async sendBulkEmail(req: Request, res: Response) {
    try {
      const { id } = req["currentUser"];
      const bulkEmailData: BulkEmailDto = req.body;

      // Create a temporary campaign for bulk email
      const campaign = new EmailerModel({
        campaignName: `Bulk Email - ${new Date().toISOString()}`,
        subject: bulkEmailData.subject,
        fromName: bulkEmailData.fromName,
        fromEmail: bulkEmailData.fromEmail,
        replyToEmail: bulkEmailData.replyToEmail,
        htmlContent: bulkEmailData.htmlContent,
        textContent: bulkEmailData.textContent,
        recipientType: "INDIVIDUAL",
        recipients: bulkEmailData.emails.map(email => ({
          email,
          status: "PENDING"
        })),
        scheduleType: "IMMEDIATE",
        emailService: "SENDGRID",
        status: "SENDING",
        author: new mongoose.Types.ObjectId(id)
      });

      await campaign.save();

      try {
        // Send bulk emails
        const result = await sendBulkEmail(
          bulkEmailData.emails,
          {
            subject: bulkEmailData.subject,
            htmlContent: bulkEmailData.htmlContent,
            textContent: bulkEmailData.textContent,
            fromName: bulkEmailData.fromName,
            fromEmail: bulkEmailData.fromEmail,
            replyToEmail: bulkEmailData.replyToEmail
          },
          "SENDGRID"
        );

        // Update campaign with results
        campaign.serviceCampaignId = result.campaignId;
        campaign.serviceMessageId = result.messageId;
        campaign.status = "SENT";
        campaign.totalSent = result.sentCount;

        // Update recipient statuses
        campaign.recipients.forEach(recipient => {
          recipient.status = "SENT";
          recipient.sentAt = new Date();
        });

        await campaign.save();

        res.status(200).json({
          success: true,
          message: "Bulk email sent successfully",
          response: {
            campaignId: campaign._id,
            serviceCampaignId: result.campaignId,
            totalSent: result.sentCount,
            status: campaign.status
          }
        });
      } catch (sendError) {
        campaign.status = "FAILED";
        await campaign.save();

        res.status(500).json({
          success: false,
          message: "Failed to send bulk email",
          error: sendError.message
        });
      }

      // Invalidate cache
      await invalidateCache('EMAILER');
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get email campaign statistics
  static async getStats(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];

      const cacheKey = `emailer_stats_${role}_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      let baseQuery: any = { status: { $ne: "DELETED" } };
      if (role !== Roles.ADMIN) {
        baseQuery.author = new mongoose.Types.ObjectId(id);
      }

      const [
        totalCampaigns,
        draftCampaigns,
        sentCampaigns,
        scheduledCampaigns,
        totalEmailsSent,
        monthlyStats
      ] = await Promise.all([
        EmailerModel.countDocuments(baseQuery),
        EmailerModel.countDocuments({ ...baseQuery, status: "DRAFT" }),
        EmailerModel.countDocuments({ ...baseQuery, status: "SENT" }),
        EmailerModel.countDocuments({ ...baseQuery, status: "SCHEDULED" }),
        EmailerModel.aggregate([
          { $match: { ...baseQuery, status: "SENT" } },
          { $group: { _id: null, total: { $sum: "$totalSent" } } }
        ]),
        EmailerModel.aggregate([
          { $match: { ...baseQuery, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
              emailsSent: { $sum: "$totalSent" }
            }
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } }
        ])
      ]);

      const stats = {
        totalCampaigns,
        draftCampaigns,
        sentCampaigns,
        scheduledCampaigns,
        totalEmailsSent: totalEmailsSent.length > 0 ? totalEmailsSent[0].total : 0,
        monthlyStats: monthlyStats.map(stat => ({
          month: stat._id.month,
          year: stat._id.year,
          campaigns: stat.count,
          emailsSent: stat.emailsSent
        }))
      };

      const responsePayload = {
        success: true,
        message: "Email campaign statistics retrieved successfully",
        response: stats
      };

      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.SHORT);
      res.status(200).json(responsePayload);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update recipient status (webhook endpoint)
  static async updateRecipientStatus(req: Request, res: Response) {
    try {
      const { campaignId, recipientEmail, status, timestamp, bounceReason, errorMessage } = req.body;

      const campaign = await EmailerModel.findOne({
        _id: campaignId,
        status: { $ne: "DELETED" }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Email campaign not found"
        });
      }

      const recipient = campaign.recipients.find(r => r.email === recipientEmail);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: "Recipient not found"
        });
      }

      // Update recipient status
      recipient.status = status;
      
      if (status === "DELIVERED") {
        recipient.deliveredAt = new Date(timestamp);
      } else if (status === "OPENED") {
        recipient.openedAt = new Date(timestamp);
      } else if (status === "CLICKED") {
        recipient.clickedAt = new Date(timestamp);
      } else if (status === "BOUNCED") {
        recipient.bounceReason = bounceReason;
      } else if (status === "FAILED") {
        recipient.errorMessage = errorMessage;
      }

      // Update campaign totals
      if (status === "DELIVERED") {
        campaign.totalDelivered += 1;
      } else if (status === "OPENED") {
        campaign.totalOpened += 1;
      } else if (status === "CLICKED") {
        campaign.totalClicked += 1;
      } else if (status === "BOUNCED") {
        campaign.totalBounced += 1;
      } else if (status === "FAILED") {
        campaign.totalFailed += 1;
      }

      await campaign.save();

      res.status(200).json({
        success: true,
        message: "Recipient status updated successfully",
        response: {
          campaignId: campaign._id,
          recipientEmail,
          status,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }
}
