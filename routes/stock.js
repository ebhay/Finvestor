import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Stock } from '../models/db.js';

const router = express.Router();

//Buy

router.post("/buy", async (req, res) => {
    console.log("Stock Purchase");
});

export default router;