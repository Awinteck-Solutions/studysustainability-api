import * as express from "express"; 
import { Response, Request } from "express"; 
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { CareerController } from "../controller/career.controller";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}

Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.CAREER_CATALOGUE]),
    upload.single("careers"),
    (req: MulterRequest, res: Response) => {
        CareerController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.CAREER_CATALOGUE]),
    (req: Request, res: Response) => {
        CareerController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.CAREER_CATALOGUE]),
    upload.single("careers"),
    (req: MulterRequest, res: Response) => {
        CareerController.updateImage(req, res)
    }
);




Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.CAREER_CATALOGUE]),
    (req: Request, res: Response) => {
        CareerController.getAll(req, res)
    }
);



Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        CareerController.delete(req, res)
    }
);
Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        CareerController.permanentDelete(req, res)
    }
);


  // PUBLIC ENDPOINTS
Router.get("/public",
   (req: Request, res: Response) => {
        CareerController.getAllPublic(req, res)
    }
);


Router.get("/:id",
    (req: Request, res: Response) => {
        CareerController.getOne(req, res)
    }
);

export default Router;