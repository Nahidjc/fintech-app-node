import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { healthController } from "./controllers/healthController";
import paymentRoute from "./routes/payments";
import userRoute from "./routes/userRoutes";
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

require("./config/db");
app.get("/health", healthController);
app.use(userRoute);
app.use(paymentRoute);

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
