import User from "../model/userModel";
import { Response, Request } from "express";
import { createData, findOne, updateOne } from "../utils/databaseService";
import {
  createAccessToken,
  extractSpecificFields,
  generateUniqueAccountNumber,
  loginValidateFields
} from "../utils/userUtils";
import { USER_TYPES, transactionTypes } from "../constants/authConstant";
import { createTransactionHistory, updateCurrentBalance } from "./payment";
import TransactionModel from "../model/Payment";
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
      password,
      email,
      userType,
      mobileNo,
      referralNo
    }: {
      password: string;
      email: string;
      userType: number;
      mobileNo: string;
      referralNo: string;
    } = req.body;
    if(referralNo){
      const referrar = await findOne(User, { mobileNo: referralNo });
      if(referrar){
        await updateCurrentBalance(referrar, 50, true);
        const transaction = createTransactionHistory(
          referralNo,
          mobileNo,
          50,
          0,
          transactionTypes.REFERRAL_BONUS,
          transactionTypes.REFERRAL_BONUS,
          referrar.name,
          mobileNo
        );
        await createData(TransactionModel, transaction);
      }
    }
    if ( !password || !email || !userType || !mobileNo) {
      return res.status(400).json({ message: "Required fields are missing." });
    }
    const userExists = await findOne(User, { mobileNo });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists." });
    }
    const accountNumber = await generateUniqueAccountNumber();
    const userData = new User({
      accountNumber,
      mobileNo,
      password,
      email,
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
    const formatUser = extractSpecificFields(user);
    const accessToken = createAccessToken({
      id: user._id,
      email: user.email,
      mobileNo: user.mobileNo,
      userType: user.userType,
      accountNumber: user.accountNumber,
      currentBalance: user.currentBalance
    });

    res.json({
      user: formatUser,
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
    let result: { url?: string } = {};
    if (req.file) {
      const file = req.file;
      result = await cloudinary.uploader.upload(file.path, options);
      fs.unlink(file.path, function (err: any) {
        if (err) throw err;
      });
    }
    
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
    if (result.url) {
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


export const getUserbyId = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.params.id;
  try {        
    const user = await findOne(User, { _id: userId });
    const formatUser = extractSpecificFields(user);
    return res.json({ message: "User get successfully.", user: formatUser });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

export const validatePersonalAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { accountnumber } = req.headers;
    const accountDetails = await findOne(User, {
      mobileNo: accountnumber
    });
    if (accountDetails.userType === USER_TYPES.Personal) {
      return res.json({ validate: true });
    } else {
      return res.json({ validate: false });
    }
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

export const validateAgentAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { accountnumber } = req.headers;
    const accountDetails = await findOne(User, {
      mobileNo: accountnumber
    });
    if (accountDetails.userType === USER_TYPES.Agent) {
      return res.json({ validate: true });
    } else {
      return res.json({ validate: false });
    }
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

export const validateMarchantAccount = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { accountnumber } = req.headers;
    const accountDetails = await findOne(User, {
      mobileNo: accountnumber
    });
    if (accountDetails.userType === USER_TYPES.Marchant) {
      return res.json({ validate: true });
    } else {
      return res.json({ validate: false });
    }
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

export const validatePassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { accountnumber, password } = req.body;
    const accountDetails = await findOne(User, {
      mobileNo: accountnumber
    });
    const isValid = await bcrypt.compare(password, accountDetails.password);
    if (isValid) {
      return res.status(200).json({ isValid, message: "Password are valid" });
    } else {
      return res
        .status(400)
        .json({ isValid, message: "Password are not valid" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred during password validation" });
  }
};
