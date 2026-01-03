const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({});
        console.log('Users found:', users.length);
        console.log(users);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
