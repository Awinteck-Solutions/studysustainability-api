import * as express from "express"; 
import {Response, Request} from "express"; 
import { AuthController } from "../controller/auth.controller";
import { authentification } from "../../../middlewares/authentication.middleware";
import AdminModel from "../schema/admin.schema";
import { Notification } from "../enums/notification.enum";
import { notification } from "../../../middlewares/notification.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../enums/roles.enum";
import { Permission } from "../enums/permission.enum";


const Router = express.Router();

// ----------------------------------------- USER ROUTES ---------------------------------------------------
//
// AUTH
Router.post("/admin/signup",
    (req: Request, res: Response) => { 
        AuthController.signup(req, res)
    }
);

Router.post("/admin/profile/:id",
    (req: Request, res: Response) => { 
        AuthController.addProfile(req, res)
    }
);

Router.post("/admin/login",
    (req: Request, res: Response) => { 
        AuthController.login(req, res)
    }
);



Router.get("/admin",
    authentification,
     authorization(AdminModel,[Roles.ADMIN],[Permission.ALL]),
    (req: Request, res: Response) => { 
        AuthController.profile(req, res)
    }
);



// FORGET PASSWORD
Router.post("/admin/forgot-password",
    notification(Notification.FORGOT_PASSWORD, AdminModel),
    (req: Request, res: Response) => { 
        AuthController.forgotPassword(req,res)
    }
);


// RESET PASSWORD
Router.post("/admin/reset-password",
    notification(Notification.RESET_PASSWORD, AdminModel),
    (req: Request, res: Response) => { 
        AuthController.resetPassword(req,res)
    }
);


export default Router;