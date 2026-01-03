const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = "shravani@gmail.com";
        const password = "@abcd1234";

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found: ", email);
            process.exit(1);
        }
        console.log("User found:", user.email);
        console.log("Stored Hash:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log("SUCCESS: Password matches!");
        } else {
            console.log("FAILURE: Password does NOT match.");
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyLogin();
