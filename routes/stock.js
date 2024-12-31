import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Stock } from '../models/db.js';

import dotenv from "dotenv";
import { auth } from '../middleware/auth.js';
dotenv.config();

const router = express.Router();

//Holdings
router.get("/",auth,async (req,res)=>{
    try{
        const user=await User.find({userId : req.userId});
        const stocks=user[0].stocks;
        res.json(stocks);
        console.log(stocks);
    }
    catch(err){
        res.status(500).json({message:err.message});
        }
});

//Fetch Stock Details
router.post("/query", async (req, res) => {
    const {ticker,exchange}=req.body;
    if(!ticker || !exchange){
        return res.status(400).json({message: "Please provide ticker and exchange."});
    }
    try {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}.${exchange}&apikey=${process.env.AV_KEY}`
        );
        const data = await response.json();

        if (data['Error Message']) {
            return res.status(400).json({ message: "Invalid ticker or exchange." });
        }
        const metaData = data['Meta Data'];
        const timeSeries = data['Time Series (Daily)'];
        const lastRefreshed = metaData['3. Last Refreshed']; // Get the latest date
        const latestData = timeSeries[lastRefreshed]; // Fetch data for the latest date

        const result = {
            symbol: metaData['2. Symbol'],
            lastRefreshed: lastRefreshed,
            open: latestData['1. open'],
            high: latestData['2. high'],
            low: latestData['3. low'],
            close: latestData['4. close'],
            volume: latestData['5. volume']
        };

        res.json(result); // Return only the required fields
    } 
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Buy
router.post("/buy",auth,async (req,res)=>{
    const {ticker,exchange}=req.body;
    if(!ticker || !exchange){
        return res.status(400).json({message: "Please provide ticker and exchange."});
    }
    try {
        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}.${exchange}&apikey=${process.env.AV_KEY}`
        );
        const data = await response.json();
        if (data['Error Message']) {
            return res.status(400).json({ message: "Invalid ticker or exchange." });
        }
        const metaData = data['Meta Data'];
        const timeSeries = data['Time Series (Daily)'];
        const lastRefreshed = metaData['3. Last Refreshed']; 
        const latestData = timeSeries[lastRefreshed]; 
        const currentPrice = latestData['4. close']; 

        // Fetch user from the database
        const user = await User.findOne({ userId: req.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        if (user.stocks.length >= 5) {
            return res.status(400).json({ message: "You cannot hold more than 5 stocks." });
        }
        const newStock = {
            id: user.stocks.length + 1, 
            name: `${ticker} ${exchange}`,
            ticker,
            exchange,
            buyingPrice: currentPrice
        };
        user.stocks.push(newStock);
        await user.save();
        res.json({ message: "Stock purchased successfully!", stock: newStock });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;