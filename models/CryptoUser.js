import mongoose from "mongoose";

const CryptoUserSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: { type: String, require: true },
  password: { type: String, require: true },
});

export default mongoose.model("CryptoUser", CryptoUserSchema);