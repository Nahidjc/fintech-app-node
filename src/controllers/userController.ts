// import userModel from "../models/userModel";
import { Response } from "express";
export const signup = async (res: Response): Promise<void> => {
  // const { fullName, userName, password, rePassword, email } = req.body;
  //   if (!fullName || !userName || !password || !rePassword || !email) {
  //     return res.status(400).json({ message: "Invalid Credentials." });
  //   }
  //   const userExists = await userModel.doesExists(email);
  //   if (userExists) {
  //     return res.status(400).json({ message: "User Already Exists." });
  //   }
  //   if (password !== rePassword) {
  //     return res.status(400).json({ message: "Password Doesn't Match." });
  //   }
  //   const hashPassword = await bcrypt.hash(password, 10);

  //   const userInfo = await userModel.create({
  //     fullName,
  //     email,
  //     userName,
  //     password: hashPassword,
  //   });

  res.send({
    message: "User created Successfully"
  });
};
