import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import axios from "axios";

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.error("Database connection error:", err));

import User from './models/user.js';

const app = express();
const jwtSecret = process.env.JWT_SECRET;
app.use(express.json());

async function userExists(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(404).json({ error: "Invalid email or password" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

function generateToken(req, res) {
    const { email } = req.user;
    const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
}

async function getStockPrice(ticker, exchange) {
    try {
        const url = `https://www.google.com/finance/quote/${ticker}:${exchange}`;
        const response = await axios.get(url);
        const html = response.data;
        const priceMatch = html.match(/<div[^>]*class="YMlKec fxKbKc"[^>]*>(.*?)<\/div>/);
        if (priceMatch && priceMatch[1]) {
            return priceMatch[1];
        } else {
            throw new Error(`Price not found for ${ticker}`);
        }
    } catch (error) {
        throw new Error(`Error fetching data for ${ticker}: ${error.message}`);
    }
}

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const user = new User({ name, email, password, stocks: [] });
        await user.save();
        res.json({ message: "User created successfully" });
    } catch (error) {
        res.status(400).json({ error: "Error creating user" });
    }
});

app.post("/signin", userExists, generateToken);

app.get("/dashboard", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let totalValue = 0;
        let totalProfit = 0;
        const holdings = [];

        for (const stock of user.stocks) {
            const currentPrice = await getStockPrice(stock.ticker, stock.exchange);
            const priceValue = parseFloat(currentPrice.replace(/[^0-9.]/g, ''));

            const stockValue = priceValue;
            const profit = stockValue - stock.buyingPrice;

            holdings.push({
                name: stock.name,
                ticker: stock.ticker,
                buyingPrice: stock.buyingPrice,
                currentPrice: stockValue,
                profit: profit
            });

            totalValue += stockValue;
            totalProfit += profit;
        }

        res.json({ holdings, totalValue, totalProfit, stockCount: user.stocks.length });

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
