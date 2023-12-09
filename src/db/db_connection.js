import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//Second approach to connect to MongoDB databse with creating funcion and exporting
// connectDB = function(){}

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1); // 1 is used for failure
  }
};

export default connectDB;
