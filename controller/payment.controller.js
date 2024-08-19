import asyncHandler from "express-async-handler";

import Payment from "../models/Payment.model.js";

// @desc check payment status
// @route GET /payments
// @access private
export const payments = asyncHandler(async (req, res) => {
  const paymentData = await Payment.findById("66c32c7cd639a0e93e34a19c");

  res.json(paymentData);
});
