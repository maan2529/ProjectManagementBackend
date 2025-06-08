import mongoose, { ConnectOptions } from "mongoose";

import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const dbName: string = "College_Project";
    const dbUrl: string =
      process.env.DATABASE_URL || `mongodb://localhost:27017/${dbName}`;

    await mongoose.connect(dbUrl, { dbName } as mongoose.ConnectOptions);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
