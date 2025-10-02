import { Request, Response } from "express";
import AdminModel from "../../AUTH/schema/admin.schema";
import { Roles } from "../../AUTH/enums/roles.enum";
import { status } from "../../AUTH/enums/status.enum";
import { formatAdminResponse } from "../../AUTH/dto/admin.dto";

export class UserManagementController {
  // GET ALL USERS (excluding ADMIN users)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, role, status: userStatus } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build filter object excluding ADMIN and USER roles, and DELETED status
      const filter: any = { 
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED }
      };
      
      if (role) {
        filter.role = role;
      }
      
      if (userStatus) {
        filter.status = userStatus;
      }

      const users = await AdminModel.find(filter)
        .select('-password -otp')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalUsers = await AdminModel.countDocuments(filter);

      return res.status(200).json({
        status: true,
        message: "Users retrieved successfully",
        response: {
          users: users.map(user => ({
            ...formatAdminResponse(user, null),
            id: user._id
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / Number(limit)),
            totalUsers,
            hasNextPage: Number(page) < Math.ceil(totalUsers / Number(limit)),
            hasPrevPage: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // GET USER BY ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await AdminModel.findOne({ 
        _id: id, 
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED }
      }).select('-password -otp');

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "User retrieved successfully",
        response: {
          ...formatAdminResponse(user, null),
          id: user._id
        },
      });
    } catch (error) {
      console.error("Get user by ID error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // UPDATE USER
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated through this endpoint
      delete updateData.password;
      delete updateData.otp;
      delete updateData.role; // Prevent role changes through this endpoint

      const user = await AdminModel.findOneAndUpdate(
        { _id: id, role: { $nin: [Roles.ADMIN, Roles.USER] }, status: { $ne: status.DELETED } },
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password -otp');

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "User updated successfully",
        response: {
          ...formatAdminResponse(user, null),
          id: user._id
        },
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // DELETE USER (soft delete by changing status)
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await AdminModel.findOneAndUpdate(
        { _id: id, role: { $nin: [Roles.ADMIN, Roles.USER] }, status: { $ne: status.DELETED } },
        { $set: { status: status.INACTIVE } },
        { new: true, runValidators: true }
      ).select('-password -otp');

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "User deactivated successfully",
        response: {
          ...formatAdminResponse(user, null),
          id: user._id
        },
      });
    } catch (error) {
      console.error("Delete user error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // ACTIVATE USER
  static async activateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await AdminModel.findOneAndUpdate(
        { _id: id, role: { $nin: [Roles.ADMIN, Roles.USER] }, status: { $ne: status.DELETED } },
        { $set: { status: status.ACTIVE } },
        { new: true, runValidators: true }
      ).select('-password -otp');

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: true,
        message: "User activated successfully",
        response: {
          ...formatAdminResponse(user, null),
          id: user._id
        },
      });
    } catch (error) {
      console.error("Activate user error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // GET USER STATISTICS
  static async getUserStatistics(req: Request, res: Response) {
    try {
      // Total users (excluding ADMIN, USER, and DELETED)
      const totalUsers = await AdminModel.countDocuments({ 
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED }
      });

      // Active users (excluding ADMIN, USER, and DELETED)
      const activeUsers = await AdminModel.countDocuments({ 
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: status.ACTIVE 
      });

      // Inactive users (excluding ADMIN, USER, and DELETED)
      const inactiveUsers = await AdminModel.countDocuments({ 
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: status.INACTIVE 
      });

      // Users by role (excluding ADMIN, USER, and DELETED)
      const usersByRole = await AdminModel.aggregate([
        { $match: { role: { $nin: [Roles.ADMIN, Roles.USER] }, status: { $ne: status.DELETED } } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Users by status (excluding ADMIN, USER, and DELETED)
      const usersByStatus = await AdminModel.aggregate([
        { $match: { role: { $nin: [Roles.ADMIN, Roles.USER] }, status: { $ne: status.DELETED } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Recent registrations (last 30 days, excluding ADMIN, USER, and DELETED)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRegistrations = await AdminModel.countDocuments({
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED },
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Monthly registrations for the last 6 months (excluding ADMIN, USER, and DELETED)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyRegistrations = await AdminModel.aggregate([
        { 
          $match: { 
            role: { $nin: [Roles.ADMIN, Roles.USER] },
            status: { $ne: status.DELETED },
            createdAt: { $gte: sixMonthsAgo }
          } 
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      return res.status(200).json({
        status: true,
        message: "User statistics retrieved successfully",
        response: {
          overview: {
            totalUsers,
            activeUsers,
            inactiveUsers,
            recentRegistrations
          },
          breakdown: {
            byRole: usersByRole,
            byStatus: usersByStatus,
            monthlyRegistrations
          }
        }
      });
    } catch (error) {
      console.error("Get user statistics error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }

  // SEARCH USERS
  static async searchUsers(req: Request, res: Response) {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      if (!query || query.toString().trim().length < 2) {
        return res.status(400).json({
          status: false,
          message: "Search query must be at least 2 characters long",
        });
      }

      const searchRegex = new RegExp(query.toString(), 'i');
      
      const users = await AdminModel.find({
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED },
        $or: [
          { firstname: searchRegex },
          { lastname: searchRegex },
          { email: searchRegex },
          { fullname: searchRegex },
          { organisationName: searchRegex },
          { role: searchRegex },
          { status: searchRegex },

        ]
      })
        .select('-password -otp')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalUsers = await AdminModel.countDocuments({
        role: { $nin: [Roles.ADMIN, Roles.USER] },
        status: { $ne: status.DELETED },
        $or: [
          { firstname: searchRegex },
          { lastname: searchRegex },
          { email: searchRegex },
          { fullname: searchRegex }
        ]
      });

      return res.status(200).json({
        status: true,
        message: "Search results retrieved successfully",
        response: {
          users: users.map(user => ({
            ...formatAdminResponse(user, null),
            id: user._id
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / Number(limit)),
            totalUsers,
            hasNextPage: Number(page) < Math.ceil(totalUsers / Number(limit)),
            hasPrevPage: Number(page) > 1
          },
          searchQuery: query
        }
      });
    } catch (error) {
      console.error("Search users error:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }
}
