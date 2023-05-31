import User from "../model/userModel";
import { Response, Request } from "express";
import { create, findOne } from "../utils/databaseService";
import { generateUniqueAccountNumber } from "../utils/userUtils";
const bcrypt = require("bcrypt");
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      username,
      password,
      email,
      name,
      userType,
      mobileNo
    }: {
      username: string;
      password: string;
      email: string;
      name: string;
      userType: number;
      mobileNo: string;
    } = req.body;
    if (!username || !password || !email || !name || !userType || !mobileNo) {
      return res.status(400).json({ message: "Required fields are missing." });
    }
    const userExists = await findOne(User, { email, username, mobileNo });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists." });
    }
    const accountNumber = await generateUniqueAccountNumber();
    const hashPassword = await bcrypt.hash(password, 10);

    const userData: {
      accountNumber?: number;
      profilePic?: string;
      mobileNo?: string;
      username?: string;
      password?: string;
      email?: string;
      name?: string;
      userType: number;
    } = {
      accountNumber,
      mobileNo,
      username,
      password: hashPassword,
      email,
      name,
      userType
    };
    const userInfo = await create(User, userData);
    res.send({
      userInfo,
      message: "User created Successfully"
    });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};
