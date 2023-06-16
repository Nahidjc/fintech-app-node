const mongoosePaginate = require("mongoose-paginate-v2");
let idValidator = require("mongoose-id-validator");
import mongoose, { Document, Schema } from "mongoose";
const myCustomLabels = {
  totalDocs: "itemCount",
  docs: "data",
  limit: "perPage",
  page: "currentPage",
  nextPage: "next",
  prevPage: "prev",
  totalPages: "pageCount",
  pagingCounter: "slNo",
  meta: "paginator"
};
mongoosePaginate.paginate.options = { customLabels: myCustomLabels };

interface ITransaction extends Document {
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
  senderTransactionType?: string;
  receiverTransactionType?: string;
  amount: number;
  senderAccount: string;
  receiverAccount: string;
  fee: Number;
}

const transactionSchema = new Schema<ITransaction>(
  {
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isDeleted: { type: Boolean },
    senderTransactionType: { type: String, required: true },
    receiverTransactionType: { type: String, required: true },
    amount: {
      min: 10,
      max: 99999,
      unique: false,
      type: Number,
      required: true
    },
    fee: {
      type: Number
    },
    senderAccount: {
      min: 11,
      max: 11,
      unique: false,
      type: String,
      required: true
    },
    receiverAccount: {
      min: 11,
      max: 11,
      unique: false,
      type: String,
      required: true
    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

transactionSchema.pre("save", async function (this: ITransaction, next) {
  this.isDeleted = false;
  next();
});

transactionSchema.pre("insertMany", async function (this: any, next, docs) {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index] as ITransaction;
      element.isDeleted = false;
    }
  }
  next();
});

transactionSchema.method("toJSON", function (this: any) {
  const { _id, __v, ...object } = this.toObject({ virtuals: true });
  object.id = _id;

  return object;
});

transactionSchema.plugin(mongoosePaginate);
transactionSchema.plugin(idValidator);

const TransactionModel = mongoose.model<ITransaction>(
  "transactions",
  transactionSchema
);

export const calculateUserExpenses = async (accountnumber: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expenditureResult = await TransactionModel.aggregate([
    {
      $match: {
        senderAccount: accountnumber,
        createdAt: {
          $gte: today
        }
      }
    },
    {
      $group: {
        _id: null,
        totalExpenditure: {
          $sum: { $add: ["$amount", "$fee"] }
        }
      }
    }
  ]);

  const depositResult = await TransactionModel.aggregate([
    {
      $match: {
        receiverAccount: accountnumber,
        createdAt: {
          $gte: today
        }
      }
    },
    {
      $group: {
        _id: null,
        totalDeposit: {
          $sum: "$amount"
        }
      }
    }
  ]);

  const expenditureAmount = expenditureResult[0]?.totalExpenditure || 0;
  const depositAmount = depositResult[0]?.totalDeposit || 0;

  return [expenditureAmount, depositAmount];
};

export const getUserTransactionHistory = async (accountNumber: string) => {
  const transactions = await TransactionModel.find({
    $or: [
      { senderAccount: accountNumber },
      { receiverAccount: accountNumber },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(10);
  return transactions;
};


export default TransactionModel;
