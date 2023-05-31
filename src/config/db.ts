import mongoose from "mongoose";

const uri: string =
  process.env.NODE_ENV === "test"
    ? process.env.DB_TEST_URL!
    : process.env.DB_URL!;
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
