import * as express from "express";
import { Request, Response } from "express";
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { EmailCampaignController } from "../controllers/EmailCampaign.controller";

interface MulterRequest extends Request {
  file: multer.File;
}

const Router = express.Router();

Router.post(
  "/",
  authentification,
  upload.single("emailCampaign"),
  (req: MulterRequest, res: Response) => {
    EmailCampaignController.create(req, res);
  }
);

Router.patch(
  "/:id",
  authentification,
  upload.single("emailCampaign"),
  (req: MulterRequest, res: Response) => {
    EmailCampaignController.update(req, res);
  }
);

Router.delete(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    EmailCampaignController.delete(req, res);
  }
);

Router.get(
  "/",
  authentification,
  (req: Request, res: Response) => {
    EmailCampaignController.getAll(req, res);
  }
);

Router.get(
  "/:id",
  authentification,
  (req: Request, res: Response) => {
    EmailCampaignController.getOne(req, res);
  }
);

export default Router;
