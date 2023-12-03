const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema({
    id: Number,
    name: String,
    minFaceValue: Number,
    maxFaceValue: Number,
    count: Number,
    price: {
        min: Number,
        max: Number,
        currencyCode: String
    },
    modifiedDate: Date
});

const categorySchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String
});

const brandSchema = new mongoose.Schema({
    internalId: String,
    name: String,
    countryCode: String,
    currencyCode: String,
    description: String,
    disclaimer: String,
    redemptionInstructions: String,
    terms: String,
    logoUrl: String,
    modifiedDate: Date,
    products: [productsSchema],
    categories: [categorySchema]
});
export default mongoose.model('Brand', brandSchema);
