const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = "shravani@gmail.com";
        const newPassword = "@abcd1234";

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (updatedUser) {
            console.log("Password updated successfully for:", email);
        } else {
            console.log("User not found:", email);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetPassword();
