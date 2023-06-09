import User from "../model/userModel";
import { findOne } from "../utils/databaseService";
import crypto from "crypto";
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = 'your-refresh-token-secret';

interface User {
  userType: number;
  id: string;
  mobileNo: string;
  accountNumber: number;
  currentBalance: number;
  email: string;
}

export const createAccessToken = (user: User): string => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

export const createRefreshToken = (user: User): string => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const generateUniqueAccountNumber = async (): Promise<string> => {
  const accountNumberLength = 10;
  const accountNumberSet = new Set<string>();
  while (accountNumberSet.size < accountNumberLength) {
    const randomNumber = crypto.randomInt(0, 10).toString();
    accountNumberSet.add(randomNumber);
  }
  const accountNumber = Array.from(accountNumberSet).join("");
  const accountNumberExists = await findOne(User, { accountNumber });

  if (accountNumberExists) {
    return generateUniqueAccountNumber();
  }

  return accountNumber;
};

export const loginValidateFields = (
  mobileNo: string,
  password: string
): string | null => {
  const mobileNoRegex = /^\d{11}$/;
  const passwordRegex = /^\d{6}$/;

  if (!mobileNo) {
    return "Mobile number is required.";
  }

  if (!password) {
    return "Password is required.";
  }

  if (!mobileNoRegex.test(mobileNo)) {
    return "Invalid mobile number.";
  }

  if (!passwordRegex.test(password)) {
    return "Invalid password. It should contain least 6 digit.";
  }

  return null;
};


interface FormatUser {
  id?: string;
  username?: string;
  email?: string;
  name?: string;
  userType?: number;
  currentBalance?: number;
  accountNumber?: number;
  mobileNo?: string;
  profilePic?: string;
}

export const  extractSpecificFields = (user: FormatUser): Partial<FormatUser> =>{
  const { id, username, email, name, userType, currentBalance, accountNumber, mobileNo, profilePic } = user;
  return { id, username, email, name, userType, currentBalance, accountNumber, mobileNo, profilePic };
}