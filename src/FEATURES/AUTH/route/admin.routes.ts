import * as express from "express"; 
import {Response, Request} from "express"; 
import { AuthController } from "../controller/auth.controller";
import { authentification } from "../../../middlewares/authentication.middleware";
import AdminModel from "../schema/admin.schema";
import { Notification } from "../enums/notification.enum";
import { notification } from "../../../middlewares/notification.middleware";
import { AdminController } from "../controller/admin.controller";
import { Roles } from "../enums/roles.enum";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Permission } from "../enums/permission.enum";


const Router = express.Router();

// ----------------------------------------- USER ROUTES ---------------------------------------------------
//
// AUTH
Router.post("/create",
    authentification,
    authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => { 
        AdminController.createAdmin(req, res)
    }
);

Router.patch("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => {
        AdminController.update(req, res)
    }
);


Router.get("/list",
    authentification,
    authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => { 
        AdminController.findAll(req, res)
    }
);


Router.get("/list/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => { 
        AdminController.findOne(req, res)
    }
);

Router.delete("/:id",
    authentification,
    authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => { 
        AdminController.deleteOne(req, res)
    }
);




export default Router;