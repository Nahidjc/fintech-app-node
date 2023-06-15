import { Request, Response } from "express";
import { transactionTypes, USER_TYPES } from "../constants/authConstant";
import TransactionModel from "../model/Payment";
import User from "../model/userModel";
import { createData, findOne, updateOne } from "../utils/databaseService";
const bcrypt = require("bcrypt");

const calculateExpense = (amount: number): [number, number] => {
  const feePercentage = 0.0099;
  const fee = amount * feePercentage;
  const totalAmount = amount + fee;
  return [parseFloat(totalAmount.toFixed(2)), parseFloat(fee.toFixed(2))];
};

interface UserDetails {
  mobileNo: string;
  currentBalance: number;
}

const updateCurrentBalance = async (
  userDetails: UserDetails,
  amount: number,
  isAddition: boolean
): Promise<void> => {
  const filter = { mobileNo: userDetails.mobileNo };
  const update = isAddition
    ? { currentBalance: userDetails.currentBalance + amount }
    : { currentBalance: userDetails.currentBalance - amount };

  await updateOne(User, filter, update);
};

interface Transaction {
  receiverAccount: string;
  senderAccount: string;
  amount: number;
  fee: number;
  transactionType: string;
}

const createTransactionHistory = (
  receiverAccount: string,
  senderAccount: string,
  amount: number,
  fee: number,
  transactionType: string
): Transaction => {
  return {
    receiverAccount,
    senderAccount,
    amount,
    fee,
    transactionType
  };
};

export const createCashoutPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { accountNumber, password, receiverNumber, amount } = req.body;
    const userDetails = await findOne(User, {
      mobileNo: accountNumber
    });
    const isMatch = await bcrypt.compare(password, userDetails.password);
    if (userDetails.userType !== USER_TYPES.Personal) {
      return res.status(400).json({ message: "Account not valid for cashout" });
    }
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid password. Please try again." });
    }
    const receiverDetails = await findOne(User, {
      mobileNo: receiverNumber
    });
    const [totalAmount, fee] = calculateExpense(amount);
    await updateCurrentBalance(userDetails, totalAmount, false);
    await updateCurrentBalance(receiverDetails, amount, true);
    const transaction = createTransactionHistory(
      receiverDetails.mobileNo,
      userDetails.mobileNo,
      amount,
      fee,
      transactionTypes.cashOut
    );
    await createData(TransactionModel, transaction);
    res
      .status(200)
      .json({ message: "Congratulations! Your transaction was successful." });
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
};

export const expensesController = async (req: Request, res: Response) => {
  const { accountnumber } = req.headers;
  try {
    if (!accountnumber) {
      return res.status(400).json({ messae: "Account number is required" });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await TransactionModel.aggregate([
      {
        $match: {
          senderAccount: accountnumber.toString(),
          createdAt: {
            $gte: today
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$amount"
          }
        }
      }
    ]);
    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;
    return res.status(200).json({ totalAmount , message: 'Successfully fetched your today expense' });
  } catch (err) {
    return res.status(500).json({ message: 'An error occurred' });
  }
};