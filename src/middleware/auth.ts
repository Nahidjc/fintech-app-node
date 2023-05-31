const jwt = require("jsonwebtoken");
import { JWT_SECRET } from "./../constants/authConstant";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
}
const Auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(400).json({ msg: "Invalid Authentication." });
    }
    jwt.verify(token, JWT_SECRET.USER_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(400).json({ msg: "Invalid Authentication." });
      }
      req.user = user;
      next();
    });
  } catch (err: any) {
    return res.status(500).json({ msg: err.message });
  }
};

export default Auth;