import * as express from "express";
import { Request, Response } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { DashboardController } from "../controller/dashboard.controller";

const Router = express.Router();

// 1. Dashboard Statistics Endpoint
Router.get("/statistics",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getStatistics(req, res);
  }
);

// 2. User Registrations Analytics Endpoint
Router.get("/user-registrations",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getUserRegistrations(req, res);
  }
);

// 3. Individual Metric Endpoints
Router.get("/ads-campaigns",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getAdsCampaigns(req, res);
  }
);

Router.get("/ads-requests",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getAdsRequests(req, res);
  }
);

Router.get("/website-feedbacks",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getWebsiteFeedbacks(req, res);
  }
);

Router.get("/pdf-downloads",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getPdfDownloads(req, res);
  }
);

Router.get("/email-campaigns",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getEmailCampaigns(req, res);
  }
);

Router.get("/email-requests",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.getEmailRequests(req, res);
  }
);

// Clear dashboard cache (admin only)
Router.post("/clear-cache",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    DashboardController.clearCache(req, res);
  }
);

export default Router;
