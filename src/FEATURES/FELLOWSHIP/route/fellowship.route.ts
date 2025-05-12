import * as express from "express"; 
import {Response, Request} from "express"; 
import * as multer from "multer";
import { upload } from "../../../helpers/uploader";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { FellowshipController } from "../controller/fellowship.controller";

const Router = express.Router();

interface MulterRequest extends Request {
    file: multer.File;
}
  
Router.post("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.FELLOWSHIP]),
    upload.single("fellowships"),
    (req: MulterRequest, res: Response) => {
        FellowshipController.create(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.FELLOWSHIP]),
    upload.single("fellowships"),
    (req: MulterRequest, res: Response) => {
        FellowshipController.update(req, res)
    }
);


Router.patch("/image/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.FELLOWSHIP]),
    upload.single("fellowships"),
    (req: MulterRequest, res: Response) => {
        FellowshipController.updateImage(req, res)
    }
);




Router.get("/",
    authentification,
    authorization(AdminModel,[Roles.ADMIN, Roles.USER],[Permission.ALL,Permission.FELLOWSHIP]),
    (req: Request, res: Response) => {
        FellowshipController.getAll(req, res)
    }
);




Router.delete("/temporal/:id",
    (req: Request, res: Response) => {
        FellowshipController.delete(req, res)
    }
);

Router.delete("/permanent/:id",
    (req: Request, res: Response) => {
        FellowshipController.permanentDelete(req, res)
    }
);

// public
Router.get("/public", (req: Request, res: Response) => {
        FellowshipController.getAllPublic(req, res)
    }
);

Router.get("/:id",
    (req: Request, res: Response) => {
        FellowshipController.getOne(req, res)
    }
);

export default Router;