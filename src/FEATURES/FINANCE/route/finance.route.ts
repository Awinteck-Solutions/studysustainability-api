import * as express from "express";
import { Request, Response } from "express";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Roles } from "../../AUTH/enums/roles.enum";
import { Permission } from "../../AUTH/enums/permission.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import { FinanceController } from "../controller/finance.controller";

const Router = express.Router();

// Create new invoice
Router.post("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.create(req, res);
  }
);

// Get all invoices with pagination
Router.get("/invoices",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.getAll(req, res);
  }
);

// Get finance statistics (must come before /:id route)
Router.get("/statistics",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.getStats(req, res);
  }
);

// Update payment status (webhook endpoint - no auth required)
Router.post("/webhook/payment-status",
  (req: Request, res: Response) => {
    FinanceController.updatePaymentStatus(req, res);
  }
);

// Get single invoice
Router.get("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.getOne(req, res);
  }
);

// Update invoice
Router.put("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.update(req, res);
  }
);

// Delete invoice (soft delete)
Router.delete("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.FINANCE]),
  (req: Request, res: Response) => {
    FinanceController.delete(req, res);
  }
);

// Get payment link for invoice (public endpoint)
Router.get("/:id/payment-link",
  (req: Request, res: Response) => {
    FinanceController.getPaymentLink(req, res);
  }
);

export default Router;
