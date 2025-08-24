import * as express from "express";
import { Request, Response } from "express";
import { MarketInsightsController } from "../controllers/MarketInsights.controller";
import { authentification } from "../../../middlewares/authentication.middleware";

const Router = express.Router();

Router.post(
  "/",
  authentification,
  (req: Request, res: Response) => {
    MarketInsightsController.create(req, res);
  }
);

Router.patch(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    MarketInsightsController.update(req, res);
  }
);

Router.delete(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    MarketInsightsController.delete(req, res);
  }
);

Router.get(
  "/",
  authentification,
  (req: Request, res: Response) => {
    MarketInsightsController.getAll(req, res);
  }
);

Router.get(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    MarketInsightsController.getOne(req, res);
  }
);

export default Router;
