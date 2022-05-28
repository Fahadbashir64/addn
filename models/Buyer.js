import mongoose from "mongoose";

const BuyerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  key: { type: String, require: true },
  email: { type: String, require: true },
  name: { type: String, require: true },
  address: { type: String, require: true },
  zip: { type: String, require: true },
  balance: { type: Number },
});

export default mongoose.model("Buyer", BuyerSchema);
