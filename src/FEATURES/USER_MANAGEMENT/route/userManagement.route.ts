import * as express from "express";
import { Response, Request } from "express";
import { UserManagementController } from "../controller/userManagement.controller";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import AdminModel from "../../AUTH/schema/admin.schema";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";

const Router = express.Router();

// ----------------------------------------- USER MANAGEMENT ROUTES ---------------------------------------------------
// All routes require authentication and admin permissions

// GET ALL USERS (excluding ADMIN users)
Router.get("/users",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.getAllUsers(req, res);
    }
);

// GET USER BY ID
Router.get("/users/:id",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.getUserById(req, res);
    }
);

// UPDATE USER
Router.put("/users/:id",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.updateUser(req, res);
    }
);

// DELETE USER (soft delete - deactivate)
Router.delete("/users/:id",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.deleteUser(req, res);
    }
);

// ACTIVATE USER
Router.patch("/users/:id/activate",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.activateUser(req, res);
    }
);

// GET USER STATISTICS
Router.get("/statistics",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.getUserStatistics(req, res);
    }
);

// SEARCH USERS
Router.get("/search",
    authentification,
    authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
    (req: Request, res: Response) => {
        UserManagementController.searchUsers(req, res);
    }
);

export default Router;
