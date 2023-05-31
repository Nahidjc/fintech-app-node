import { Schema, Model, Document, Types, model } from "mongoose";
let idValidator = require("mongoose-id-validator");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcrypt");
const { USER_TYPES } = require("../constants/authConstant");

interface IUser extends Document {
  username?: string;
  password?: string;
  email?: string;
  name?: string;
  userType: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  addedBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  currentBalance?: number;
  accountNumber?: number;
  profilePic?: string;
  mobileNo?: string;
  resetPasswordLink?: {
    code: string;
    expireTime: Date;
  };
  loginRetryLimit?: number;
  loginReactiveTime?: Date;
}

const schema: Schema<IUser> = new Schema<IUser>(
  {
    username: { type: String },
    password: { type: String },
    email: { type: String },
    name: { type: String },
    userType: {
      type: Number,
      enum: Object.values(USER_TYPES),
      required: true
    },
    isActive: { type: Boolean },
    isDeleted: { type: Boolean },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    currentBalance: {
      type: Number,
      min: 0,
      max: 9999999,
      required: false,
      default: 0,
      unique: false
    },
    accountNumber: {
      type: Number,
      maxlength: 10,
      unique: true,
      required: false
    },
    profilePic: { type: String },
    mobileNo: { type: String },
    resetPasswordLink: {
      code: String,
      expireTime: Date
    },
    loginRetryLimit: {
      type: Number,
      default: 0
    },
    loginReactiveTime: { type: Date }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

schema.pre<IUser>("save", async function (next) {
  this.isDeleted = false;
  this.isActive = true;
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

schema.pre<IUser>("insertMany", async function (next, docs) {
  if (docs && docs.length) {
    for (let index = 0; index < docs.length; index++) {
      const element = docs[index];
      element.isDeleted = false;
      element.isActive = true;
    }
  }
  next();
});
  
schema.methods.isPasswordMatch = async function (password: string): Promise<boolean> {
    const user = this as IUser;
    return bcrypt.compare(password, user.password);
  };


interface IUserJSON {
    id: string;
    [key: string]: any;
}

schema.method("toJSON", function (this: IUser): IUserJSON {
    const { _id, __v, ...object } = this.toObject({ virtuals: true }) as {
        _id: Types.ObjectId;
        __v: number;
    };

    const json: IUserJSON = {
        id: _id.toHexString(),
        ...object
    };

    delete json.password;

    return json;
});


schema.plugin(idValidator);
schema.plugin(uniqueValidator,{ message: 'Error, expected {VALUE} to be unique.' });
const User: Model<IUser> = model<IUser>("user", schema);

export default User;
