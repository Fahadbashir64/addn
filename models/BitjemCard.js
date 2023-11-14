import mongoose from "mongoose";

const BitjemSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  orderId: { type: String, require: true },
  code: { type: String, require: true },
  pin: { type: String, require: true },
  date: { type: String, require: true },
  status: { type: String, require: true },
  currency: { type: String, require: true },
  orderBy: { type: String, require: true },
  cryptoValue: { type: Number, require: true },
});

export default mongoose.model("Bitjem", BitjemSchema);
