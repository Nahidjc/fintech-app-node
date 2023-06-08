import User from "../model/userModel";
import { Response, Request } from "express";
import { createData, findOne, updateOne } from "../utils/databaseService";
import {
  createAccessToken,
  generateUniqueAccountNumber,
  loginValidateFields
} from "../utils/userUtils";
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
cloudinary.config({
  cloud_name: "dptowkzy5",
  api_key: "748767756259122",
  api_secret: "v995w2mgWdkClaBUwK9vqG9Cm2k"
});

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
    const userData = new User({
      accountNumber,
      mobileNo,
      username,
      password,
      email,
      name,
      userType
    });
    const userInfo = await createData(User, userData);
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

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { password, mobileNo }: { password: string; mobileNo: string } =
      req.body;
    const validationError = loginValidateFields(mobileNo, password);
    if (validationError) {
      return res
        .status(400)
        .json({ message: validationError, statusCode: 400 });
    }
    const user = await findOne(User, { mobileNo });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(404)
        .json({ message: "Password Doesn't Match.", statusCode: 404 });
    }

    const accessToken = createAccessToken({
      id: user._id,
      email: user.email,
      mobileNo: user.mobileNo,
      userType: user.userType,
      accountNumber: user.accountNumber,
      currentBalance: user.currentBalance
    });

    res.json({
      token: accessToken,
      message: "Login Successfully",
      statusCode: 200
    });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

interface IUser {
  name?: string;
  email?: string;
  username?: string;
  profilePic?: string;
}

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true
  };
  const userId = req.params.id;
  const {
    username,
    email,
    name
  }: {
    username: string;
    email: string;
    name: string;
  } = req.body;
  try {
    const file = await req.file;
    const result = await cloudinary.uploader.upload(file.path, options);
    fs.unlink(file.path, function (err: any) {
      if (err) throw err;
    });
    const user = await findOne(User, { _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    let data: Partial<IUser> = {};

    if (name !== undefined) {
      data.name = name;
    }
    if (email !== undefined) {
      data.email = email;
    }
    if (username !== undefined) {
      data.username = username;
    }
    if (file !== undefined) {
      data.profilePic = result.url;
    }

    const updatedUser = await updateOne(User, { _id: userId }, data);
    return res.json({ message: "User updated successfully.", updatedUser });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};
