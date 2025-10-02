import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv"; 

dotenv.config();
const { JWT_SECRET = "" } = process.env;
export class encrypt {
  static async encryptpass(password: string) {
    return bcrypt.hashSync(password, 12);
  }
  static async comparepassword(hashPassword: string, password: string) {
    let response = bcrypt.compareSync(password, hashPassword);
    return response
  }

  static generateToken(payload: any) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "300d" });
  }
}