import { Request, Response } from "express";
import { CACHE_KEYS, CACHE_DURATION, getCachedData, setCachedData } from "../../../util/redis-helper";
import ProfessionalCourseModel from "../../PROFESSIONAL_COURSE/schema/professionalcourse.schema";
import UniProgramModel from "../../UNIVERSITY_PROGRAMS/schema/uniprograms.schema";
import OpenDaysModel from "../../OpenDays/schema/OpenDays.schema";
import EventsModel from "../../EVENTS/schema/events.schema";

export class AnalyticsController {
  // Get comprehensive analytics across all main models
  static async getAnalytics(req: Request, res: Response) {
    try {
      const cacheKey = CACHE_KEYS.ANALYTICS.COMPREHENSIVE;

      // Check cache first
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const [
        professionalCourseStats,
        uniProgramStats,
        openDaysStats,
        eventsStats
      ] = await Promise.all([
        // Professional Course Statistics
        Promise.all([
          ProfessionalCourseModel.countDocuments({ status: { $ne: "DELETED" } }),
          ProfessionalCourseModel.countDocuments({ status: "ACTIVE" }),
          ProfessionalCourseModel.countDocuments({ status: "INACTIVE" }),
          ProfessionalCourseModel.countDocuments({ status: "REJECTED" })
        ]),
        
        // University Programs Statistics
        Promise.all([
          UniProgramModel.countDocuments({ status: { $ne: "DELETED" } }),
          UniProgramModel.countDocuments({ status: "ACTIVE" }),
          UniProgramModel.countDocuments({ status: "INACTIVE" }),
          UniProgramModel.countDocuments({ status: "REJECTED" })
        ]),
        
        // Open Days Statistics
        Promise.all([
          OpenDaysModel.countDocuments({ status: { $ne: "DELETED" } }),
          OpenDaysModel.countDocuments({ status: "ACTIVE" }),
          OpenDaysModel.countDocuments({ status: "INACTIVE" }),
          OpenDaysModel.countDocuments({ status: "REJECTED" })
        ]),
        
        // Events Statistics
        Promise.all([
          EventsModel.countDocuments({ status: { $ne: "DELETED" } }),
          EventsModel.countDocuments({ status: "ACTIVE" }),
          EventsModel.countDocuments({ status: "INACTIVE" }),
          EventsModel.countDocuments({ status: "REJECTED" })
        ])
      ]);

      const analytics = {
        professionalCourses: {
          total: professionalCourseStats[0],
          active: professionalCourseStats[1],
          inactive: professionalCourseStats[2],
          rejected: professionalCourseStats[3],
          activePercentage: professionalCourseStats[0] > 0 ? 
            Math.round((professionalCourseStats[1] / professionalCourseStats[0]) * 100) : 0,
          inactivePercentage: professionalCourseStats[0] > 0 ? 
            Math.round((professionalCourseStats[2] / professionalCourseStats[0]) * 100) : 0,
          rejectedPercentage: professionalCourseStats[0] > 0 ? 
            Math.round((professionalCourseStats[3] / professionalCourseStats[0]) * 100) : 0
        },
        universityPrograms: {
          total: uniProgramStats[0],
          active: uniProgramStats[1],
          inactive: uniProgramStats[2],
          rejected: uniProgramStats[3],
          activePercentage: uniProgramStats[0] > 0 ? 
            Math.round((uniProgramStats[1] / uniProgramStats[0]) * 100) : 0,
          inactivePercentage: uniProgramStats[0] > 0 ? 
            Math.round((uniProgramStats[2] / uniProgramStats[0]) * 100) : 0,
          rejectedPercentage: uniProgramStats[0] > 0 ? 
            Math.round((uniProgramStats[3] / uniProgramStats[0]) * 100) : 0
        },
        openDays: {
          total: openDaysStats[0],
          active: openDaysStats[1],
          inactive: openDaysStats[2],
          rejected: openDaysStats[3],
          activePercentage: openDaysStats[0] > 0 ? 
            Math.round((openDaysStats[1] / openDaysStats[0]) * 100) : 0,
          inactivePercentage: openDaysStats[0] > 0 ? 
            Math.round((openDaysStats[2] / openDaysStats[0]) * 100) : 0,
          rejectedPercentage: openDaysStats[0] > 0 ? 
            Math.round((openDaysStats[3] / openDaysStats[0]) * 100) : 0
        },
        events: {
          total: eventsStats[0],
          active: eventsStats[1],
          inactive: eventsStats[2],
          rejected: eventsStats[3],
          activePercentage: eventsStats[0] > 0 ? 
            Math.round((eventsStats[1] / eventsStats[0]) * 100) : 0,
          inactivePercentage: eventsStats[0] > 0 ? 
            Math.round((eventsStats[2] / eventsStats[0]) * 100) : 0,
          rejectedPercentage: eventsStats[0] > 0 ? 
            Math.round((eventsStats[3] / eventsStats[0]) * 100) : 0
        },
        summary: {
          totalRecords: professionalCourseStats[0] + uniProgramStats[0] + openDaysStats[0] + eventsStats[0],
          totalActive: professionalCourseStats[1] + uniProgramStats[1] + openDaysStats[1] + eventsStats[1],
          totalInactive: professionalCourseStats[2] + uniProgramStats[2] + openDaysStats[2] + eventsStats[2],
          totalRejected: professionalCourseStats[3] + uniProgramStats[3] + openDaysStats[3] + eventsStats[3],
          overallActivePercentage: (professionalCourseStats[0] + uniProgramStats[0] + openDaysStats[0] + eventsStats[0]) > 0 ? 
            Math.round(((professionalCourseStats[1] + uniProgramStats[1] + openDaysStats[1] + eventsStats[1]) / 
            (professionalCourseStats[0] + uniProgramStats[0] + openDaysStats[0] + eventsStats[0])) * 100) : 0,
          mostActiveModel: this.getMostActiveModel(professionalCourseStats[1], uniProgramStats[1], openDaysStats[1], eventsStats[1]),
          leastActiveModel: this.getLeastActiveModel(professionalCourseStats[1], uniProgramStats[1], openDaysStats[1], eventsStats[1])
        }
      };

      const responsePayload = {
        status: true,
        message: "Analytics retrieved successfully",
        response: analytics,
        metadata: {
          generatedAt: new Date().toISOString(),
          excludesDeleted: true,
          models: ["ProfessionalCourse", "UniversityPrograms", "OpenDays", "Events"]
        }
      };

      // Cache the result for 30 minutes
      await setCachedData(cacheKey, responsePayload, CACHE_DURATION.MEDIUM);
      res.status(200).json(responsePayload);

    } catch (error) {
      console.log('error :>> ', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Helper method to determine most active model
  private static getMostActiveModel(professional: number, university: number, openDays: number, events: number): string {
    const models = [
      { name: "ProfessionalCourse", count: professional },
      { name: "UniversityPrograms", count: university },
      { name: "OpenDays", count: openDays },
      { name: "Events", count: events }
    ];
    
    const mostActive = models.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return mostActive.name;
  }

  // Helper method to determine least active model
  private static getLeastActiveModel(professional: number, university: number, openDays: number, events: number): string {
    const models = [
      { name: "ProfessionalCourse", count: professional },
      { name: "UniversityPrograms", count: university },
      { name: "OpenDays", count: openDays },
      { name: "Events", count: events }
    ];
    
    const leastActive = models.reduce((min, current) => 
      current.count < min.count ? current : min
    );
    
    return leastActive.name;
  }
}
