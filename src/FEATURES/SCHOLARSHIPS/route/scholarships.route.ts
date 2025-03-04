import * as express from "express"; 
import {Response, Request} from "express"; 
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { ScholarshipsController } from "../controller/scholarships.controller";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}
  
Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.SCHOLARSHIP]),
    upload.single("scholarships"),
    (req: MulterRequest, res: Response) => {
        ScholarshipsController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.SCHOLARSHIP]),
    upload.single("scholarships"),
    (req: MulterRequest, res: Response) => {
        ScholarshipsController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.SCHOLARSHIP]),
    upload.single("scholarships"),
    (req: MulterRequest, res: Response) => {
        ScholarshipsController.updateImage(req, res)
    }
);




Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.SCHOLARSHIP]),
    (req: Request, res: Response) => {
        ScholarshipsController.getAll(req, res)
    }
);


Router.get("/:id",
    (req: Request, res: Response) => {
        ScholarshipsController.getOne(req, res)
    }
);


Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        ScholarshipsController.delete(req, res)
    }
);
Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        ScholarshipsController.permanentDelete(req, res)
    }
);


export default Router;