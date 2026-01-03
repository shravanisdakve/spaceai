const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
    // Capture all potential fields from signup
    const { email, password, displayName, university } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
        return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with all available initial data
    await User.create({
        email,
        password: hashedPassword,
        displayName,
        university
    });

    res.status(201).json({ message: "Signup successful" });
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Select all fields except password
    const user = await User.findOne({ email });
    if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // Return full user object (excluding password which is not selected by default if we used projection, but here we just strip it manually or rely on transformation)
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
});

// UPDATE PROFILE
router.put("/profile", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updates = req.body;

        // Prevent updating sensitive fields directly via this endpoint if needed, or assume validation
        delete updates.password;
        delete updates.email; // Usually change email requires different flow

        const user = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ user });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;