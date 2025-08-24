import * as express from "express"; 
import path = require("path");

import userRoutes from '../FEATURES/AUTH/route/user.routes';
import authRoutes from '../FEATURES/AUTH/route/auth.routes';
import adminRoutes from '../FEATURES/AUTH/route/admin.routes';

import uniprogramsRoutes from '../FEATURES/UNIVERSITY_PROGRAMS/route/uniprograms.route';
import careerRoutes from '../FEATURES/CAREER/route/career.route';
import eventsRoutes from '../FEATURES/EVENTS/route/events.route';
import fellowshipRoutes from '../FEATURES/FELLOWSHIP/route/fellowship.route';
import freeCourseRoutes from '../FEATURES/FREE_COURSES/route/freecourse.route';
import grantsRoutes from '../FEATURES/GRANTS/route/grants.route';
import jobsRoutes from '../FEATURES/JOBS/route/jobs.route';
import professionalCourseRoutes from '../FEATURES/PROFESSIONAL_COURSE/route/professionalcourse.route';
import scholarshipsRoutes from '../FEATURES/SCHOLARSHIPS/route/scholarships.route';

// New features from noredis branch
import surveyRoutes from '../FEATURES/Survey/route/Survey.route';
import openDaysRoutes from '../FEATURES/OpenDays/route/OpenDays.route';
import marketInsightsRoutes from '../FEATURES/MarketInsights/route/MarketInsights.route';
import interestFormRoutes from '../FEATURES/INTERESTFORM/route/InterestForm.route';
import engagementRoutes from '../FEATURES/Engagement/route/Engagement.route';
import emailCampaignRoutes from '../FEATURES/EmailCampaign/route/EmailCampaign.route';
import displayAdvertRoutes from '../FEATURES/DisplayAdvert/route/DisplayAdvert.route';
const Router = express.Router();

Router.use("/auth", authRoutes);

Router.use("/users", userRoutes);

Router.use('/admin-management',adminRoutes)



Router.use("/university-programs", uniprogramsRoutes);


Router.use("/careers", careerRoutes);
Router.use("/events", eventsRoutes);
Router.use("/fellowships", fellowshipRoutes);
Router.use("/free-courses", freeCourseRoutes);
Router.use("/grants", grantsRoutes);
Router.use("/jobs", jobsRoutes);
Router.use("/professional-courses", professionalCourseRoutes);
Router.use("/scholarships", scholarshipsRoutes);

// New feature routes from noredis branch
Router.use("/survey", surveyRoutes);
Router.use("/open-days", openDaysRoutes);
Router.use("/market-insights", marketInsightsRoutes);
Router.use("/interest-form", interestFormRoutes);
Router.use("/engagement", engagementRoutes);
Router.use("/email-campaign", emailCampaignRoutes);
Router.use("/display-advert", displayAdvertRoutes);


export { Router }