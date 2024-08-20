import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import Payment from "../models/Payment.model.js";

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

// @desc change password
// @route POST /changePassword
// @access private
export const changePassword = asyncHandler(async (req, res) => {
  const userPhNo = req.phoneNo;

  const { oldPassword, newPassword } = req.body;

  if (!userPhNo) {
    return res
      .status(404)
      .json({ message: "Could not change password, please login once again" });
  }

  const foundUser = await User.findOne({ phoneNo: userPhNo }).select(
    "+password"
  );

  if (!foundUser) {
    return res.status(404).json({ message: "User not found!!" });
  }

  const match = bcrypt.compareSync(oldPassword, foundUser.password);

  if (!match) {
    return res.status(404).json({
      message: "Could not change password, Entered old password is incorrect!!",
    });
  }

  const hash = bcrypt.hashSync(newPassword, 10);

  foundUser.password = hash;
  foundUser.rawPassword = newPassword;

  await foundUser.save();

  res.json({ message: "Password changed successfully" });
});

// @desc Get payment details
// @route POST /changePassword
// @access private
export const getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await await Payment.findById("66c32c7cd639a0e93e34a19c");

  if (!payment)
    return res.status(404).json({ message: "Could not fing the payment" });

  res.json(payment);
});
