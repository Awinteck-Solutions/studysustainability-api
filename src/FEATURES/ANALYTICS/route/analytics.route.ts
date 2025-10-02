import * as express from "express";
import { Response, Request } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { AnalyticsController } from "../controller/analytics.controller";

const Router = express.Router();

// Single analytics endpoint
Router.get("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ANALYTICS]),
  (req: Request, res: Response) => {
    AnalyticsController.getAnalytics(req, res);
  }
);

export default Router;
