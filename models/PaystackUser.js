import mongoose from "mongoose";

const PaystackUserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, require: true },
  key: { type: String, require: true },
});

export default mongoose.model("PaystackUser", PaystackUserSchema);