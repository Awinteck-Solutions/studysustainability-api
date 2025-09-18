import * as express from "express";
import { Request, Response } from "express";
import { AdvertiseController } from "../controller/advertise.controller";
import { authentification } from "../../../middlewares/authentication.middleware";
import { authorization } from "../../../middlewares/authorization.middleware";
import { Permission } from "../../AUTH/enums/permission.enum";
import { Roles } from "../../AUTH/enums/roles.enum";
import AdminModel from "../../AUTH/schema/admin.schema";
import * as multer from "multer";

const Router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images for displayImage field
    if (file.fieldname === 'displayImage') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for displayImage field'));
      }
    }
    // Allow PDFs for pdfFile field
    else if (file.fieldname === 'pdfFile') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for pdfFile field'));
      }
    }
    // Allow any file for other fields
    else {
      cb(null, true);
    }
  }
});

// Public routes (no authentication required)
// Get all public advertisements (for website display)
Router.get("/public", (req: Request, res: Response) => {
  AdvertiseController.getAllPublic(req, res);
});

// Track view of advertisement (public)
Router.post("/:id/view", (req: Request, res: Response) => {
  AdvertiseController.trackView(req, res);
});

// Track click on advertisement (public)
Router.post("/:id/click", (req: Request, res: Response) => {
  AdvertiseController.trackClick(req, res);
});

// Get single advertisement (public)
Router.get("/:id", (req: Request, res: Response) => {
  AdvertiseController.getOne(req, res);
});

// Protected routes (authentication required)
// Get all advertisements (user/admin specific)
Router.get("/",
  authentification,
  (req: Request, res: Response) => {
    AdvertiseController.getAll(req, res);
  }
);

// Create new advertisement
Router.post("/",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE]),
  upload.fields([
    { name: 'displayImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ]),
  (req: Request, res: Response) => {
    AdvertiseController.create(req, res);
  }
);

// Update advertisement
Router.patch("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE]),
  upload.fields([
    { name: 'displayImage', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
  ]),
  (req: Request, res: Response) => {
    AdvertiseController.update(req, res);
  }
);

// Update only image
Router.patch("/:id/image",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE]),
  upload.single('displayImage'),
  (req: Request, res: Response) => {
    AdvertiseController.updateImage(req, res);
  }
);

// Update only PDF
Router.patch("/:id/pdf",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE]),
  upload.single('pdfFile'),
  (req: Request, res: Response) => {
    AdvertiseController.updatePdf(req, res);
  }
);

// Soft delete advertisement
Router.delete("/:id",
  authentification,
  authorization(AdminModel, [Roles.ADMIN, Roles.USER], [Permission.ALL, Permission.ADVERTISE]),
  (req: Request, res: Response) => {
    AdvertiseController.delete(req, res);
  }
);

// Permanent delete advertisement (admin only)
Router.delete("/:id/permanent",
  authentification,
  authorization(AdminModel, [Roles.ADMIN], [Permission.ALL]),
  (req: Request, res: Response) => {
    AdvertiseController.permanentDelete(req, res);
  }
);

export default Router;
