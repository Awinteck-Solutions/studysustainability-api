// routes/survey.route.ts

import * as express from "express";
import { Request, Response } from "express";
import { SurveyController } from "../controllers/Survey.controller";
import { authentification } from "../../../middlewares/authentication.middleware";

const Router = express.Router();

Router.post(
  "/",
  authentification,
  (req: Request, res: Response) => {
    SurveyController.create(req, res);
  }
);

Router.patch(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    SurveyController.update(req, res);
  }
);

Router.delete(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    SurveyController.delete(req, res);
  }
);

Router.get(
  "/",
  authentification,
  (req: Request, res: Response) => {
    SurveyController.getAll(req, res);
  }
);

Router.get(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    SurveyController.getOne(req, res);
  }
);

export default Router;
