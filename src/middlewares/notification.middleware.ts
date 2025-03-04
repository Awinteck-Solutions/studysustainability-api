import { NextFunction, Request, Response } from "express";
import { randomUUID } from 'crypto';
import { encrypt } from "../helpers/tokenizer";
import { sendMail } from "../helpers/emailer";
import { Notification } from "../FEATURES/AUTH/enums/notification.enum";
import { Model } from "mongoose";
import { status } from "../FEATURES/AUTH/enums/status.enum";




export const notification = (roles: Notification, model: any): any => {

    if (roles == Notification.FORGOT_PASSWORD) { 
        return forgotPassword(model);
    }
    else if (roles == Notification.RESET_PASSWORD) { 
        // console.log('roles :>> ', roles);
        return resetPassword(model);
    }

    // switch (roles) {
    //     case Notification.FORGOT_PASSWORD:
    //         forgotPassword();
    //         break;
        
    //     case Notification.NEW_ACCOUNT:
    //         forgotPasswordl();
    //         break;
        
    //     case Notification.RESET_PASSWORD:
    //         resetPassword();

    //         break;
        
    //     case Notification.SHIPMENT:
        
    //         break;
        
    //     default:
    //         break;
    // }

};


const forgotPassword = (model) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {email} = req.body
        
            const otp = randomUUID()
            .replace(/\D/g, "")
            .substring(0, 6);
            
                const user = await model.findOne({ email, status: status.ACTIVE  });
                if (!user) {
                    return res.status(404).json({
                        message: 'User not found',
                    });
                    
                } else {
                    user.otp = otp
                    await user.save()
                    sendMail(
                        user.email,
                        user.firstname,
                        'StudySustainability.com - Password Reset Token',
                        'resetHtml',
                        otp
                    )
                }


        } catch (error) {
            return res
            .status(500)
            .json({ message: "Internal server error", error:error.message});
     
        }
        next();
      };
}


const resetPassword = (model) => { 
    return async (req: Request, res: Response, next: NextFunction) => {
        try { 
            const {otp, password} = req.body
    
            const user = await model.findOne({ otp, status: status.ACTIVE  });
            if (!user) {
                console.log('user :>> ', user);
                return res.status(404).json({
                    message: 'Invalid token',
                });
                
            } else {
                let encryptPassword = await encrypt.encryptpass(password);
                user.password = encryptPassword
                await user.save()
                sendMail(
                    user.email,
                    user.firstname,
                    'StudySustainability.com - Password Reset',
                    'resetSuccessHtml',
                    ''
                )
            }
        } catch (error) {
            console.log('err000',error)
            return res
            .status(500)
            .json({ message: "Internal server error", error});
     
        }
        next();
      };
}