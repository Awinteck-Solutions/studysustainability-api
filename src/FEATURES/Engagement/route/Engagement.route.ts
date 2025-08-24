import * as express from "express";
import { Request, Response } from "express";
import { EngagementController } from "../controllers/Engagement.controller";
import { authentification } from "../../../middlewares/authentication.middleware";

const Router = express.Router();

Router.post(
  "/track",
//   authentification,
  (req: Request, res: Response) => {
    EngagementController.track(req, res);
  }
);

Router.get(
  "/",
//   authentification,
  (req: Request, res: Response) => {
    EngagementController.getAll(req, res);
  }
);

Router.get(
  "/:itemId",
//   authentification,
  (req: Request, res: Response) => {
    EngagementController.getByItem(req, res);
  }
);

Router.get(
  "/analytics/:itemId",
//   authentification,
  (req: Request, res: Response) => {
    EngagementController.analyticsForItem(req, res);
  }
);


export default Router;
