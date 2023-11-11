import mongoose from "mongoose";

const DiscountSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, require: true },
  type: { type: String, require: true },
  rate: { type: Number, default: 0 },
});

export default mongoose.model("Discount", DiscountSchema);
