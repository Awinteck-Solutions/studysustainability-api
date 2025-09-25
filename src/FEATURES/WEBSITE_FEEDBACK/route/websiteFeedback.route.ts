import * as express from "express";
import { Response, Request } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { WebsiteFeedbackController } from "../controller/websiteFeedback.controller";

const Router = express.Router();

// Public endpoint for submitting website feedback
Router.post("/submit", (req: Request, res: Response) => {
  WebsiteFeedbackController.submitFeedback(req, res);
});

// Admin/Protected routes
Router.post("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.create(req, res);
  }
);

Router.get("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.getAll(req, res);
  }
);

Router.get("/analytics",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.getAnalytics(req, res);
  }
);

Router.get("/stats",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.getStats(req, res);
  }
);

Router.get("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.getOne(req, res);
  }
);

Router.patch("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.update(req, res);
  }
);

Router.delete("/temporal/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.delete(req, res);
  }
);

Router.delete("/permanent/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.WEBSITE_FEEDBACK]),
  (req: Request, res: Response) => {
    WebsiteFeedbackController.permanentDelete(req, res);
  }
);

export default Router;
