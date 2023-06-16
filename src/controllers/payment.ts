import { Request, Response } from "express";
import { transactionTypes, USER_TYPES } from "../constants/authConstant";
import TransactionModel, { calculateUserExpenses, getUserTransactionHistory } from "../model/Payment";
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
  receiverName?: string;
  senderName?: string;
}

const createTransactionHistory = (
  receiverAccount: string,
  senderAccount: string,
  amount: number,
  fee: number,
  transactionType: string,
  receiverName?: string,
  senderName?: string
): Transaction => {
  return {
    receiverAccount,
    senderAccount,
    amount,
    fee,
    transactionType,
    receiverName,
    senderName
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
      transactionTypes.CASH_OUT,
      receiverDetails.name,
      userDetails.name
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
    const  [expenditureAmount, depositAmount] = await calculateUserExpenses(accountnumber.toString());

    return res
      .status(200)
      .json({
        expenditureAmount,
        depositAmount,
        message: "Successfully fetched your today expense"
      });
  } catch (err) {
    return res.status(500).json({ message: "An error occurred" });
  }
};

export const getUserTransactions  = async (req: Request, res: Response) => {
  const { accountnumber } = req.headers;
  try{
    const transactions = await getUserTransactionHistory(accountnumber.toString());
    res.status(200).json({ transactions, message: "Your transactions fetched successfully" });
  }catch (err) {
    return res.status(500).json({ message: "Failed to fetched Transactions" });
  }
};