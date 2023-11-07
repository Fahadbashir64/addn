import mongoose from "mongoose";

const OrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: String, require: true },
  brand: { type: String, require: false },
  price: { type: Number, require: true },
  date: { type: String, require: false },
  status: { type: String, require: true },
});

export default mongoose.model("Order", OrderSchema);
