import * as express from "express";
import { Response, Request } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { SubscriberController } from "../controller/subscriber.controller";

const Router = express.Router();

// Admin/User routes (protected)
Router.post("/",
  (req: Request, res: Response) => {
    SubscriberController.create(req, res);
  }
);

Router.patch("/:id",
  (req: Request, res: Response) => {
    SubscriberController.update(req, res);
  }
);

Router.get("/",
  (req: Request, res: Response) => {
    SubscriberController.getAll(req, res);
  }
);

Router.get("/:id",
 (req: Request, res: Response) => {
    SubscriberController.getOne(req, res);
  }
);

Router.delete("/temporal/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.SUBSCRIBERS]),
  (req: Request, res: Response) => {
    SubscriberController.delete(req, res);
  }
);

Router.delete("/permanent/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.SUBSCRIBERS]),
  (req: Request, res: Response) => {
    SubscriberController.permanentDelete(req, res);
  }
);

// Public routes (no authentication required)
Router.post("/subscribe", (req: Request, res: Response) => {
  SubscriberController.subscribe(req, res);
});

Router.post("/unsubscribe", (req: Request, res: Response) => {
  SubscriberController.unsubscribe(req, res);
});

export default Router;
