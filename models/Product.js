import mongoose from "mongoose";

// Define the schema for the product data
const productSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productId: Number,
  count: Number,
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

export default mongoose.model("Product", productSchema);
