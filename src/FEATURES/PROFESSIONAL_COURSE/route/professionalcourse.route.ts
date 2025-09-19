import * as express from "express"; 
import {Response, Request} from "express"; 
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { ProfessionalCourseController } from "../controller/professionalcourse.controller";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}
  
Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.PROFESSIONALS],[Permission.ALL,Permission.PROFESSIONAL_COURSE]),
    upload.single("professionals"),
    (req: MulterRequest, res: Response) => {
        ProfessionalCourseController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.PROFESSIONALS],[Permission.ALL,Permission.PROFESSIONAL_COURSE]),
    upload.single("professionals"),
    (req: MulterRequest, res: Response) => {
        ProfessionalCourseController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.PROFESSIONALS],[Permission.ALL,Permission.PROFESSIONAL_COURSE]),
    upload.single("professionals"),
    (req: MulterRequest, res: Response) => {
        ProfessionalCourseController.updateImage(req, res)
    }
);

Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.PROFESSIONALS],[Permission.ALL,Permission.PROFESSIONAL_COURSE]),
    (req: Request, res: Response) => {
        ProfessionalCourseController.getAll(req, res)
    }
);



Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        ProfessionalCourseController.delete(req, res)
    }
);

Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        ProfessionalCourseController.permanentDelete(req, res)
    }
);


// Public
Router.get("/public", (req: Request, res: Response) => {
        ProfessionalCourseController.getAllPublic(req, res)
    }
);


Router.get("/:id",
    (req: Request, res: Response) => {
        ProfessionalCourseController.getOne(req, res)
    }
);

export default Router;