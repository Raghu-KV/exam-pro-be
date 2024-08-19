import Payment from "./../models/Payment.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const paymentVerify = async (req, res, next) => {
  const paymentDetails = await Payment.findById("66c32c7cd639a0e93e34a19c");

  if (paymentDetails.isPaid) {
    next();
  } else {
    res.status(402).json({ message: "Payment required!" });
  }
};
