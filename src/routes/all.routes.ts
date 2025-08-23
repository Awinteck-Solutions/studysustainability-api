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


export { Router }