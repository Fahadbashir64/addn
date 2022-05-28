import mongoose from "mongoose";

const promoSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  code: { type: String, require: true },
  discount: { type: Number, require: true },
});

export default mongoose.model("Promo", promoSchema);
