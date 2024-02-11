import mongoose from "mongoose";

// Define the schema for the product data
const ozchestProductSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  brandId: String,
  productId: Number,
  name: String,
  count: Number,
  isUpdated: Boolean,
  minFaceValue: Number,
  maxFaceValue: Number,
  dateModified: {
    type: Date,
    default: Date.now,
  },
  price: {
    min: Number,
    max: Number,
    currencyCode: String,
  },
});

export default mongoose.model("OzchestProduct", ozchestProductSchema);
