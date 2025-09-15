import {Request, Response} from "express";
import {encrypt} from "../../../helpers/tokenizer";
import getRandomInt from "../../../helpers/random";
import {AdminDto, formatAdminResponse} from "../dto/admin.dto";
import AdminModel from "../schema/admin.schema";
import {status} from "../enums/status.enum";
import {Roles} from "../enums/roles.enum";
import {Permission} from "../enums/permission.enum";

export class AuthController {
  // SIGNUP
  static async signup(req: Request, res: Response) {
    try {
      const {password, role} = req.body;

      // Check if the email already exists
      //generate OTP code
      var otp = getRandomInt(999, 9999);

      const encryptedPassword = await encrypt.encryptpass(password);

      const permissions =
        role == "ADMIN"
          ? [Permission.ALL]
          : role == "STUDENT"
          ? [Permission.STUDENT]
          : role == "PROFESSIONALS"
          ? [Permission.PROFESSIONAL_COURSE]
          : role == "EVENT_ORGANISER"
          ? [Permission.EVENTS]
          : [Permission.UNIVERSITY_PROGRAMS];

      const admin = AdminModel({
        ...req.body,
        password: encryptedPassword,
        permissions,
        otp,
      });
      admin
        .save()
        .then((response) => {
          const token = encrypt.generateToken({
            _id: response._id,
            email: response.email,
            firstname: response.firstname,
            lastname: response.lastname,
            role: response.role,
          });

          return res.status(201).json({
            message: "New user registered",
            response: {
              ...formatAdminResponse(response, token),
              id: response._id,
            },
          });
        })
        .catch((error) => {
          console.log("error :>> ", error.message);
          return res.status(404).json({
            message: "Unsuccessful registration",
            other: error.message,
          });
        });

      //    sendMail(
      //     user.email,
      //     user.firstname,
      //     'LMG - Welcome',
      //     'signupHtml',''
      // )
    } catch (error) {
      return res
        .status(500)
        .json({message: "Internal server error", error: error["sqlMessage"]});
    }
  }

  // LOGIN
  static async login(req: Request, res: Response) {
    try {
      const {email, password} = req.body;
      if (!email || !password) {
        return res.status(500).json({message: " email and password required"});
      }

      AdminModel.findOne({email, status: status.ACTIVE})
        .then(async (response) => {
          console.log('response', response)
          let hashPassword = response.password;
          let isPasswordCorrect = await encrypt.comparepassword(
            hashPassword,
            password
          );
          console.log("isPasswordCorrect :>> ", isPasswordCorrect);
          if (isPasswordCorrect) {
            const token = encrypt.generateToken({
              id: response._id,
              email: response.email,
              firstname: response.firstname,
              lastname: response.lastname,
              role: response.role,
            });
            return res.json({
              message: "Login success",
              response: {
                ...formatAdminResponse(response, token),
                _id: response._id,
              },
            });
          } else {
            res.status(404).json({
              message: "Invalid Credential",
            });
          }
        })
        .catch((error) => {
          console.log("error :>> ", error);
          res.status(403).json({
            message: "Invalid Credentials",
          });
        });

      // sendMail(
      //     'barnabassampawin@gmail.com',
      //     user.firstname,
      //     'Login success',
      //     'signup',''
      // )
    } catch (error) {
      console.error(error);
      return res.status(500).json({message: "Internal server error"});
    }
  }

  // GET PROFILE
  static async profile(req: Request, res: Response) {
    try {
      const {id} = req["currentUser"];
      console.log("id :>> ", id);
      const response = await AdminModel.findById(id);
      return res.status(201).json({
        message: "Success",
        response: formatAdminResponse(response, null),
      });
    } catch (error) {
      return res
        .status(500)
        .json({message: "Internal server error", error: error["sqlMessage"]});
    }
  }

  // FORGET PASSWORD
  static async forgotPassword(req: Request, res: Response) {
    try {
      const {email} = req.body;
      res.status(200).json({message: "Reset token sent to your email"});
    } catch (error) {
      return res
        .status(500)
        .json({message: "Internal server error", error: error["sqlMessage"]});
    }
  }

  // RESET PASSWORD
  static async resetPassword(req: Request, res: Response) {
    try {
      const {otp, password} = req.body;
      res
        .status(200)
        .json({message: "Your password has been reset successfull"});
    } catch (error) {
      return res
        .status(500)
        .json({message: "Internal server error", error: error["sqlMessage"]});
    }
  }

  static async addProfile(req: Request, res: Response) {
    try {
      const admin = await AdminModel.findByIdAndUpdate(
        req.params.id,
        {$set: req.body},
        {new: true, runValidators: true}
      );

      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
        });
      }

      return res.status(200).json({
        message: "Profile updated successfully",
        response: admin,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
        error: error.message || error,
      });
    }
  }
}
