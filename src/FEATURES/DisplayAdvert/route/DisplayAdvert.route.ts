import * as express from "express";
import {Response, Request} from "express";
import * as multer from "multer";
import {DisplayAdvertsController} from "../controllers/DisplayAdvert.controller";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import AdminModel from "../../AUTH/schema/admin.schema";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
const Router = express.Router();

// ----------------------------------------- DisplayAdvert ROUTES ---------------------------------------------------
//
// routes/display-adverts.route.ts
interface MulterRequest extends Request {
  file: multer.File;
}

Router.post("/",
    authentification,
    // authorization(AdminModel,
    //     [Roles.ADMIN, Roles.EVENT_ORGANIZER, Roles.PROFESSIONALS, Roles.UNIVERSITY,],
    //     [Permission.ALL, Permission.PROFESSIONAL_COURSE]),
    
     upload.single("displayAdvertisement"),
    (req: MulterRequest, res: Response) => {
  DisplayAdvertsController.create(req, res);
});

Router.patch("/:id",
    authentification,
     upload.single("displayAdvertisement"),
    (req: MulterRequest, res: Response) => {
  DisplayAdvertsController.update(req, res);
});

Router.delete("/:id",
     authentification,
    (req: Request, res: Response) => {
  DisplayAdvertsController.delete(req, res);
});

Router.get("/",
    //  authentification,
    (req: Request, res: Response) => {
  DisplayAdvertsController.getAll(req, res);
});

Router.get("/:id",
     authentification,
    (req: Request, res: Response) => {
  DisplayAdvertsController.getOne(req, res);
});

export default Router;

