import * as express from "express";
import { Response, Request } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { AdvertiseWithUsController } from "../controller/advertiseWithUs.controller";

const Router = express.Router();

// Public endpoint for submitting advertise with us requests
Router.post("/submit", (req: Request, res: Response) => {
  AdvertiseWithUsController.submitRequest(req, res);
});

// Admin/Protected routes
Router.post("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.create(req, res);
  }
);

Router.get("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.getAll(req, res);
  }
);

Router.get("/stats",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.getStats(req, res);
  }
);

Router.get("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.getOne(req, res);
  }
);

Router.patch("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.update(req, res);
  }
);

Router.delete("/temporal/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.delete(req, res);
  }
);

Router.delete("/permanent/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE_WITH_US]),
  (req: Request, res: Response) => {
    AdvertiseWithUsController.permanentDelete(req, res);
  }
);

export default Router;
