import {Request, Response} from "express";
import InterestForm from "../schema/InterestForm.schema";
import mongoose from "mongoose";

export class InterestFormController {
  static async findAll(req: Request, res: Response) {
    try {
      let response = await InterestForm.find();

      return res.status(200).json({
        success: true,
        message: "Interest Form successful response",
        response,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }

  static async find(req: Request, res: Response) {
    try {
      let response = await InterestForm.find({menuId: new mongoose.Types.ObjectId(req.params.id)});

      return res.status(200).json({
        success: true,
        message: "Interest Form successful response",
        response,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }


  static async add(req: Request, res: Response) {
    try {
      const interestForm = req.body
      let response = new InterestForm(interestForm);
      await response.save();

      return res.status(201).json({
        success: true,
        message: "Interest Form added successful",
        response,
      });
    } catch (e) {
      console.log('e :>> ', e);
      return res.status(500).json({
        success: false,
        message: "System error",
      });
    }
  }
}
