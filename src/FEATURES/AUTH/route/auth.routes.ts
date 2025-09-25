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
import { upload } from "../../../helpers/uploader";


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



Router.get("/admin/profile",
    authentification,
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

// UPLOAD PROFILE IMAGE
Router.post("/admin/upload-profile-image",
    authentification,
    upload.single('profileImage'),
    (req: Request, res: Response) => { 
        AuthController.uploadProfileImage(req, res)
    }
);

// CHANGE PASSWORD
Router.post("/admin/change-password",
    authentification,
    (req: Request, res: Response) => { 
        AuthController.changePassword(req, res)
    }
);




export default Router;