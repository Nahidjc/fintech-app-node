import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import mongoose from "mongoose";
import userRoute from "./routes/userRoutes";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

mongoose.set("strictQuery", false);
mongoose.connect(
  `mongodb+srv://nahid:nahidhasan@cluster0.5nvzpqp.mongodb.net/e-commerce?retryWrites=true&w=majority`,
  err => {
    if (err) {
      console.log("Something went wrong", err);
    } else {
      console.log("connected");
    }
  }
);

app.use(userRoute);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
