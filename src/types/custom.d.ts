import "express";
import multer from "multer";

declare global {
    namespace Express {
        interface Request {
            file?: multer.File;
            files?: multer.File[];
        }
    }
}

// Create a comprehensive request type that includes all necessary properties
export interface CustomRequest extends Express.Request {
    file?: multer.File;
    files?: multer.File[];
    body: any;
    params: any;
    query: any;
    headers: any;
    cookies: any;
    session: any;
    user?: any;
}

// Type guard to check if request has file upload
export function hasFileUpload(req: any): req is CustomRequest;
