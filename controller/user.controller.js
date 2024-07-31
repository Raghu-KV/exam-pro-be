import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

// @desc add a user manually
// @route POST /register
// @access private & only for Developers
export const registerUser = asyncHandler(async (req, res) => {
  const { userName, phoneNo, password, secret, roll } = req.body;

  if (!secret) return res.status(404).json({ message: "Need Secret" });

  if (secret == process.env.REGISTER_USER_SECRET) {
    const hashPassword = bcrypt.hashSync(password, 12);

    const user = User.create({
      userName,
      phoneNo,
      password: hashPassword,
      roll,
    });
    res.json(user);
  } else {
    res.status(404).json({ message: "Secret unmatched" });
  }
});
