import * as express from "express"; 
import {Response, Request} from "express"; 
import { UserController } from "../controller/user.controller";
import { authentification } from "../../../middlewares/authentication.middleware";
import { Roles } from "../enums/roles.enum";
import { upload } from "../../../helpers/uploader";
import path = require("path");

import multer from "multer";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Permission } from "../enums/permission.enum";
import AdminModel from "../schema/admin.schema";

// Extend Express Request to include Multer's file property
interface MulterRequest extends Request {
  file: multer.File;
}

const Router = express.Router();
 
// DELETE ACCOUNT
Router.delete("/delete-user/:id",
    authentification,
    (req: Request, res: Response) => { 
        UserController.deleteUser(req,res)
    }
);


// GET ALL USERS
Router.get("/", 
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => { 
        UserController.getAllUsers(req, res)
    }
);

// GET SINGLE USERS
Router.get("/:id", 
    (req: Request, res: Response) => { 
        UserController.getOneUser(req, res)
    }
);




// GET PROFILE
Router.get("/profile",
    authentification,
    (req: Request, res: Response) => { 
       UserController.profile(req,res)
    }
);


// UPDATE PROFILE
Router.patch("/update-user",
    authentification,
    (req: MulterRequest, res: Response) => { 
       UserController.updateUser(req,res)
    }
);

// CHANGE PASSWORD
Router.patch("/change-password",
    authentification,
    (req: Request, res: Response) => { 
       UserController.changePassword(req,res)
    }
);







export default Router;