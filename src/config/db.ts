import mongoose from "mongoose";
import { DB_URL, DB_TEST_URL, NODE_ENV } from "./variables";
const uri: string = NODE_ENV === "test" ? DB_TEST_URL : DB_URL;
mongoose.set("strictQuery", false);
mongoose.connect(uri);
const db = mongoose.connection;

db.once("open", () => {
  console.log("Connection Successful");
});

db.on("error", () => {
  console.log("Error in MongoDB connection");
});

export default mongoose;
