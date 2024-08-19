import mongoose from "mongoose";

const paymemtScheme = mongoose.Schema({
  isPaid: Boolean,
  isDue: Boolean,
  dueAmount: Number,
  dueDate: String,
});

const Payment = mongoose.model("Payment", paymemtScheme);

export default Payment;
