import dotenv from "dotenv";
import connectDB from "./db/db_connection.js";
dotenv.config({ path: "./env" });

import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Server Error", error);
    });

    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to the database", error);
  });

// First approach to connect to database with IIFE function

/* (async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on((error) => {
      console.log("Not able to connect with express", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
})(); */

// (() => {})() arrow syntax
//(function () {})(); normal syntax
