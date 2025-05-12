import * as express from "express"; 
import {Response, Request} from "express"; 
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { JobsController } from "../controller/jobs.controller";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}
  
Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.JOBS]),
    upload.single("jobs"),
    (req: MulterRequest, res: Response) => {
        JobsController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.JOBS]),
    upload.single("jobs"),
    (req: MulterRequest, res: Response) => {
        JobsController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.JOBS]),
    upload.single("jobs"),
    (req: MulterRequest, res: Response) => {
        JobsController.updateImage(req, res)
    }
);




Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.JOBS]),
    (req: Request, res: Response) => {
        JobsController.getAll(req, res)
    }
);



Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        JobsController.delete(req, res)
    }
);
Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        JobsController.permanentDelete(req, res)
    }
);


// Public
Router.get("/public", (req: Request, res: Response) => {
        JobsController.getAllPublic(req, res)
    }
);


Router.get("/:id",
    (req: Request, res: Response) => {
        JobsController.getOne(req, res)
    }
);



export default Router;