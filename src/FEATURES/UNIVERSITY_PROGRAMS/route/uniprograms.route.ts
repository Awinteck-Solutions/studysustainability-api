import * as express from "express"; 
import {Response, Request} from "express"; 
import { UniProgramsController } from "../controller/uniprograms.controller";
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}
  
Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.UNIVERSITY],[Permission.ALL,Permission.UNIVERSITY_PROGRAMS]),
    upload.single("uniprograms"),
    (req: MulterRequest, res: Response) => {
        UniProgramsController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.UNIVERSITY],[Permission.ALL,Permission.UNIVERSITY_PROGRAMS]),
    upload.single("uniprograms"),
    (req: MulterRequest, res: Response) => {
        UniProgramsController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.UNIVERSITY],[Permission.ALL,Permission.UNIVERSITY_PROGRAMS]),
    upload.single("uniprograms"),
    (req: MulterRequest, res: Response) => {
        UniProgramsController.updateImage(req, res)
    }
);




Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER, Roles.UNIVERSITY],[Permission.ALL,Permission.UNIVERSITY_PROGRAMS]),
    (req: Request, res: Response) => {
        UniProgramsController.getAll(req, res)
    }
);

// Public
Router.get("/public", (req: Request, res: Response) => {
    UniProgramsController.getAllPublic(req, res)
}
);

// Get unique institutions (public endpoint)
Router.get("/institutions", (req: Request, res: Response) => {
    UniProgramsController.getUniqueInstitutions(req, res)
}
);



Router.get("/uni/:id",
    (req: Request, res: Response) => {
        UniProgramsController.getByUniversity(req, res)
    }
);


Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        UniProgramsController.delete(req, res)
    }
);
Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        UniProgramsController.permanentDelete(req, res)
    }
);

Router.get(
  "/dashboard-metrics",
    authentification,
    (req: Request, res: Response) => {
        UniProgramsController.getUniversityDashboardMetrics(req, res)
    }
);

Router.get("/:id",
    (req: Request, res: Response) => {
        UniProgramsController.getOne(req, res)
    }
);


export default Router;