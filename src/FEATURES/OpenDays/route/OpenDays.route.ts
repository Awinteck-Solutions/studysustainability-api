import * as express from "express";
import { Request, Response } from "express";
import * as multer from "multer";
import { OpenDaysController } from "../controllers/OpenDays.controller";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";

interface MulterRequest extends Request {
  file: multer.File;
}

const Router = express.Router();

Router.post(
  "/",
  authentification,
  upload.single("openDay"),
  (req: MulterRequest, res: Response) => {
    OpenDaysController.create(req, res);
  }
);

Router.patch(
  "/:id",
  authentification,
  upload.single("openDay"),
  (req: MulterRequest, res: Response) => {
    OpenDaysController.update(req, res);
  }
);

Router.delete(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    OpenDaysController.delete(req, res);
  }
);

Router.get(
  "/",
  authentification,
  (req: Request, res: Response) => {
    OpenDaysController.getAll(req, res);
  }
);

Router.get(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    OpenDaysController.getOne(req, res);
  }
);

export default Router;
