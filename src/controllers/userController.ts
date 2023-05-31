import User from "../model/userModel";
import { Response, Request } from "express";
import { createData, findOne } from "../utils/databaseService";
import { generateUniqueAccountNumber } from "../utils/userUtils";
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: "dptowkzy5",
  api_key: "748767756259122",
  api_secret: "v995w2mgWdkClaBUwK9vqG9Cm2k"
});

export const register = async (req: Request, res: Response): Promise<any> => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true
  };
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
    const file = await req.file;
    
    const result = await cloudinary.uploader.upload(file.path, options);

    const accountNumber = await generateUniqueAccountNumber();
    const hashPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      accountNumber,
      mobileNo,
      username,
      password: hashPassword,
      email,
      name,
      userType,
      profilePic: result.url
    });
    const userInfo = await createData(User, userData);
    fs.unlink(file.path, function (err: any) {
      if (err) throw err;
    });
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
