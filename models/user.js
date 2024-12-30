import mongoose from "mongoose";

// Define the Stock Schema
const StockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    exchange: { type: String, required: true },
    buyingPrice: { type: Number, required: true }
});


// Define the User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    stocks: {
        type: [StockSchema],
        maxlength: 5, // Limit array length to 5
        required: true
    },
    profit: { type: Number, default: 0.0 }
});


const User = mongoose.model("User", UserSchema);
export default User;