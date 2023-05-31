import User from "../model/userModel";
import { findOne } from "../utils/databaseService";

export const generateUniqueAccountNumber = async (): Promise<number> => {
  const accountNumberLength = 10;
  const accountNumberSet = new Set<string>();
  while (accountNumberSet.size < accountNumberLength) {
    const randomNumber = Math.floor(Math.random() * 10).toString();
    accountNumberSet.add(randomNumber);
  }
  const accountNumber = Array.from(accountNumberSet).join("");
  const accountNumberExist = await findOne(User, { accountNumber });
  if (accountNumberExist) {
    return generateUniqueAccountNumber();
  }
  return parseInt(accountNumber);
};
