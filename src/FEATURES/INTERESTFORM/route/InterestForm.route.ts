import * as express from "express";
import {Response, Request} from "express";
import {InterestFormController} from "../controllers/InterestForm.controller";
const Router = express.Router();

// ----------------------------------------- InterestForm ROUTES ---------------------------------------------------
//
Router.get("/", (req: Request, res: Response) => {
  InterestFormController.findAll(req, res);
});

Router.get("/:id", (req: Request, res: Response) => {
    InterestFormController.find(req, res);
});
  
Router.post("/", (req: Request, res: Response) => {
    InterestFormController.add(req, res);
  });

export default Router;
