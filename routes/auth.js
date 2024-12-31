import express from 'express';
import jwt from 'jsonwebtoken';
import { User, Stock } from '../models/db.js';

import { v4 as uuidv4 } from 'uuid';
const uniqueId = uuidv4();
const router = express.Router();

import dotenv from "dotenv";
dotenv.config();

import bcrypt from 'bcrypt';
const saltRounds = 10;

//Register

router.post("/register", async (req, res) => {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User Exist" });
        }
        const userId = uniqueId;
        password = await bcrypt.hash(password, saltRounds);
        const user = new User({ userId, name, email, password, stocks: [] });
        await user.save();
        res.json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Error creating user" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.json({ token: `Bearer ${token}`, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Password Update
router.put("/forgetpassword", async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const { password: newPassword } = req.body;

    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    if (!newPassword) {
        return res.status(400).json({ error: "New password is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.password = await bcrypt.hash(newPassword, saltRounds); // Hash the new password
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error in forgetpassword route:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

// Delete User
router.delete("/user", async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: "Authorization token is required" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { userId } = decoded;

        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await User.deleteOne({ userId });
        res.json({ result: "User Deleted" });
    } catch (error) {
        console.error("Error in Deletion Route", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;