import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Stock } from '../models/db.js';

import dotenv from "dotenv";
import { auth } from '../middleware/auth.js';
dotenv.config();

const router = express.Router();

//Buy
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
router.post("/buy", async (req, res) => {
    console.log("Stock Purchase");
});

export default router;