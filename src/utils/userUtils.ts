import User from "../model/userModel";
import { findOne } from "../utils/databaseService";
import crypto from "crypto";

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
