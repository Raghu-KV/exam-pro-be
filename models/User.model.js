import mongoose from "mongoose";
import { randomUUID } from "crypto";

const userSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      default: () => randomUUID(),
      immutable: true,
    },

    userName: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roll: {
      type: String,
      required: true,
    },

    lastLogin: {
      type: Date,
      default: () => Date.now(),
    },
  },
  { timeStamp: true }
);

const User = mongoose.model("User", userSchema);

export default User;
