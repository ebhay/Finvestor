import mongoose from "mongoose";

const StockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    exchange: { type: String, required: true },
    buyingPrice: { type: Number, required: true }
});

export default mongoose.model('Stock', StockSchema);
