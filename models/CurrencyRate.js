import mongoose from "mongoose";

const CurrencyRateSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  currencyCode: { type: String, require: true },
  value: { type: Number, require: true },
  dateModified: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("CurrencyRate", CurrencyRateSchema);
