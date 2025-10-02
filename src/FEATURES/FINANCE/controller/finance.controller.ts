import { Request, Response } from "express";
import FinanceModel from "../schema/finance.schema";
import { CreateFinanceDto, UpdateFinanceDto, StripePaymentLinkDto, PaymentStatusUpdateDto } from "../dto/finance.dto";
import { getCachedData, setCachedData, invalidateCache, CACHE_DURATION, CACHE_KEYS } from "../../../util/redis-helper";
import { Roles } from "../../AUTH/enums/roles.enum";
import mongoose from "mongoose";

// Mock Stripe integration - replace with actual Stripe SDK
const createStripePaymentLink = async (amount: number, currency: string, description: string): Promise<StripePaymentLinkDto> => {
  // This is a mock implementation - replace with actual Stripe API calls
  const mockPaymentLinkId = `plink_${Date.now()}`;
  const mockPaymentLinkUrl = `https://checkout.stripe.com/pay/${mockPaymentLinkId}`;
  
  return {
    paymentLinkUrl: mockPaymentLinkUrl,
    paymentLinkId: mockPaymentLinkId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
};

const createStripeInvoice = async (invoiceData: any): Promise<string> => {
  // Mock implementation - replace with actual Stripe API calls
  return `inv_${Date.now()}`;
};

export class FinanceController {
  // Create new invoice
  static async create(req: Request, res: Response) {
    try {
      const { id } = req["currentUser"];
      const invoiceData: CreateFinanceDto = req.body;

      // Map DTO to schema structure
      const invoicePayload = {
        author: new mongoose.Types.ObjectId(id),
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        clientPhone: invoiceData.clientPhone,
        clientAddress: invoiceData.clientAddress,
        items: invoiceData.items,
        taxRate: invoiceData.taxRate || 0,
        discountRate: invoiceData.discountRate || 0,
        dueDate: new Date(invoiceData.dueDate),
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        totalAmount: invoiceData.total,
        currency: invoiceData.currency || "USD",
        subtotal: invoiceData.subtotal,
        paymentMethod: invoiceData.paymentMethod || "STRIPE"
      };

      // Create the invoice
      const invoice = new FinanceModel(invoicePayload);

      await invoice.save();

      // Create Stripe payment link if payment method is STRIPE
      if (invoice.paymentMethod === "STRIPE") {
        try {
          const stripeInvoiceId = await createStripeInvoice({
            amount: invoice.totalAmount,
            currency: invoice.currency,
            description: `Invoice ${invoice.invoiceNumber}`,
            customer_email: invoice.clientEmail,
            metadata: {
              invoiceId: invoice._id.toString(),
              invoiceNumber: invoice.invoiceNumber
            }
          });

          const paymentLink = await createStripePaymentLink(
            invoice.totalAmount,
            invoice.currency,
            `Invoice ${invoice.invoiceNumber}`
          );

          invoice.stripeInvoiceId = stripeInvoiceId;
          invoice.stripePaymentLinkUrl = paymentLink.paymentLinkUrl;
          
          await invoice.save();
        } catch (stripeError) {
          console.error("Stripe integration error:", stripeError);
          // Continue without Stripe integration if it fails
        }
      }

      // Invalidate cache
      await invalidateCache('FINANCE');

      res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        response: invoice
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get all invoices with pagination
  static async getAll(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Extract filter parameters
      const paymentStatus = req.query.paymentStatus as string;
      const clientEmail = req.query.clientEmail as string;
      const search = req.query.search as string;

      if (role == Roles.ADMIN) {
        // Create cache key with pagination and filters
        const cacheKey = `finance_admin_${page}_${limit}_${paymentStatus || ''}_${clientEmail || ''}_${search || ''}`;
        
        // Check cache first
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        // Build query
        let query: any = { status: { $ne: "DELETED" } };

        if (paymentStatus) {
          query.paymentStatus = paymentStatus;
        }

        if (clientEmail) {
          query.clientEmail = { $regex: clientEmail, $options: 'i' };
        }

        if (search) {
          query.$or = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { clientName: { $regex: search, $options: 'i' } },
            { clientEmail: { $regex: search, $options: 'i' } }
          ];
        }

        const [invoices, total] = await Promise.all([
          FinanceModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          FinanceModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          success: true,
          message: "Invoices retrieved successfully",
          metadata: {
            total,
            page,
            limit,
            totalPages,
            filters: {
              paymentStatus: paymentStatus || null,
              clientEmail: clientEmail || null,
              search: search || null
            }
          },
          response: invoices
        };

        // Cache the result
        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      } else {
        // User-specific invoices
        const cacheKey = `finance_user_${id}_${page}_${limit}_${paymentStatus || ''}_${clientEmail || ''}_${search || ''}`;
        
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
          return res.json(cachedData);
        }

        let query: any = {
          author: new mongoose.Types.ObjectId(id),
          status: { $ne: "DELETED" }
        };

        if (paymentStatus) {
          query.paymentStatus = paymentStatus;
        }

        if (clientEmail) {
          query.clientEmail = { $regex: clientEmail, $options: 'i' };
        }

        if (search) {
          query.$or = [
            { invoiceNumber: { $regex: search, $options: 'i' } },
            { clientName: { $regex: search, $options: 'i' } },
            { clientEmail: { $regex: search, $options: 'i' } }
          ];
        }

        const [invoices, total] = await Promise.all([
          FinanceModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          FinanceModel.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        const responsePayload = {
          success: true,
          message: "Invoices retrieved successfully",
          metadata: {
            total,
            page,
            limit,
            totalPages,
            filters: {
              paymentStatus: paymentStatus || null,
              clientEmail: clientEmail || null,
              search: search || null
            }
          },
          response: invoices
        };

        await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
        res.status(200).json(responsePayload);
      }
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get single invoice
  static async getOne(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const invoiceId = req.params.id;

      let query: any = { _id: invoiceId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const invoice = await FinanceModel.findOne(query);

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Invoice retrieved successfully",
        response: invoice
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update invoice
  static async update(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const invoiceId = req.params.id;
      const updateData: UpdateFinanceDto = req.body;

      let query: any = { _id: invoiceId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const invoice = await FinanceModel.findOneAndUpdate(
        query,
        updateData,
        { new: true }
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found"
        });
      }

      // Update Stripe payment link if needed
      if (invoice.paymentMethod === "STRIPE" && updateData.items) {
        try {
          const paymentLink = await createStripePaymentLink(
            invoice.totalAmount,
            invoice.currency,
            `Invoice ${invoice.invoiceNumber}`
          );

          invoice.stripePaymentLinkId = paymentLink.paymentLinkId;
          invoice.stripePaymentLinkUrl = paymentLink.paymentLinkUrl;
          
          await invoice.save();
        } catch (stripeError) {
          console.error("Stripe integration error:", stripeError);
        }
      }

      // Invalidate cache
      await invalidateCache('FINANCE');

      res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        response: invoice
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete invoice (soft delete)
  static async delete(req: Request, res: Response) {
    try {
      const { id, role } = req["currentUser"];
      const invoiceId = req.params.id;

      let query: any = { _id: invoiceId, status: { $ne: "DELETED" } };
      
      if (role !== Roles.ADMIN) {
        query.author = new mongoose.Types.ObjectId(id);
      }

      const invoice = await FinanceModel.findOneAndUpdate(
        query,
        { status: "DELETED" },
        { new: true }
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found"
        });
      }

      // Invalidate cache
      await invalidateCache('FINANCE');

      res.status(200).json({
        success: true,
        message: "Invoice deleted successfully",
        response: invoice
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Update payment status (webhook endpoint)
  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { invoiceId, paymentStatus, stripePaymentIntentId, paidDate, notes }: PaymentStatusUpdateDto = req.body;

      // First get the existing invoice to preserve notes
      const existingInvoice = await FinanceModel.findOne({ _id: invoiceId, status: { $ne: "DELETED" } });
      
      const invoice = await FinanceModel.findOneAndUpdate(
        { _id: invoiceId, status: { $ne: "DELETED" } },
        {
          paymentStatus,
          stripePaymentIntentId,
          paidDate: paymentStatus === "PAID" ? (paidDate || new Date()) : null,
          notes: notes || existingInvoice?.notes
        },
        { new: true }
      );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found"
        });
      }

      // Invalidate cache
      await invalidateCache('FINANCE');
      // await invalidateCache('finance_stats');

      res.status(200).json({
        success: true,
        message: "Payment status updated successfully",
        response: invoice
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get payment link for invoice
  static async getPaymentLink(req: Request, res: Response) {
    try {
      const invoiceId = req.params.id;

      const invoice = await FinanceModel.findOne({
        _id: invoiceId,
        status: { $ne: "DELETED" }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found"
        });
      }

      if (invoice.paymentMethod !== "STRIPE") {
        return res.status(400).json({
          success: false,
          message: "Payment method is not Stripe"
        });
      }

      if (!invoice.stripePaymentLinkUrl) {
        return res.status(400).json({
          success: false,
          message: "Payment link not available"
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment link retrieved successfully",
        response: {
          paymentLinkUrl: invoice.stripePaymentLinkUrl,
          paymentLinkId: invoice.stripePaymentLinkId,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency,
          dueDate: invoice.dueDate
        }
      });
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get invoice statistics
  static async getStats(req: Request, res: Response) {
    try { 

      const cacheKey = `finance_stats`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      let baseQuery: any = { status: { $ne: "DELETED" } }; 

      const [
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        failedInvoices,
        totalRevenue,
        monthlyStats
      ] = await Promise.all([
        FinanceModel.countDocuments(baseQuery),
        FinanceModel.countDocuments({ ...baseQuery, paymentStatus: "PENDING" }),
        FinanceModel.countDocuments({ ...baseQuery, paymentStatus: "PAID" }),
        FinanceModel.countDocuments({ ...baseQuery, paymentStatus: "FAILED" }),
        FinanceModel.aggregate([
          { $match: { ...baseQuery, paymentStatus: "PAID" } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]),
        FinanceModel.aggregate([
          { $match: { ...baseQuery, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
          {
            $group: {
              _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
              count: { $sum: 1 },
              revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalAmount", 0] } }
            }
          },
          { $sort: { "_id.year": -1, "_id.month": -1 } }
        ])
      ]);

      const stats = {
        totalInvoices,
        pendingInvoices,
        paidInvoices,
        failedInvoices,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyStats: monthlyStats.map(stat => ({
          month: stat._id.month,
          year: stat._id.year,
          count: stat.count,
          revenue: stat.revenue
        }))
      };

      const responsePayload = {
        success: true,
        message: "Finance statistics retrieved successfully",
        response: stats
      };

      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.SHORT);
      res.status(200).json(responsePayload);
    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }
}
