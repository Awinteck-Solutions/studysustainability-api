import * as express from "express";
import { Request, Response } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { EmailerController } from "../controller/emailer.controller";

const Router = express.Router();

// Create new email campaign
Router.post("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.create(req, res);
  }
);

// Get all email campaigns with pagination
Router.get("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.getAll(req, res);
  }
);

// Update email campaign
Router.put("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.update(req, res);
  }
);

// Delete email campaign (soft delete)
Router.delete("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.delete(req, res);
  }
);

// Send email campaign
Router.post("/:id/send",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.sendCampaign(req, res);
  }
);

// Send bulk email
Router.post("/bulk/send",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.sendBulkEmail(req, res);
  }
);

// Get email campaign statistics
Router.get("/stats/overview",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.getStats(req, res);
  }
);

// Update recipient status (webhook endpoint - no auth required)
Router.post("/webhook/recipient-status",
  (req: Request, res: Response) => {
    EmailerController.updateRecipientStatus(req, res);
  }
);

// Get single email campaign
Router.get("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.EMAILER]),
  (req: Request, res: Response) => {
    EmailerController.getOne(req, res);
  }
);

export default Router;
