import mongoose from "mongoose";

const TransactionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
  user: { type: String, require: false },
  type: { type: String, require: true },
  date: { type: String, require: false },
  balanceBefore: { type: Number, require: true },
  balanceAfter: { type: Number, require: true },
  totalAmount: { type: Number, require: true },
  status: { type: String, require: true },
});

export default mongoose.model("Transaction", TransactionSchema);