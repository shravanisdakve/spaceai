const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const resetDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Delete all users
        await User.deleteMany({});
        console.log('All users deleted. Database cleared.');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetDb();
