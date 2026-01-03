const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    // Account
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Identity
    displayName: { type: String }, // Public facing name
    firstName: { type: String },
    lastName: { type: String },
    avatar: { type: String }, // URL or Base64

    // Personal (Optional)
    bio: { type: String, maxLength: 200 },
    location: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },

    // Education
    university: { type: String },
    degree: { type: String }, // e.g. "B.S. Computer Science"
    yearOfStudy: { type: String }, // e.g. "Sophomore", "3rd Year"
    fieldOfStudy: { type: String },
    academicGoals: { type: String },
    gpa: { type: String },

    // Preferences
    preferences: {
        studyLanguage: { type: String, default: "English" },
        theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
        learningPace: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
        learningStyle: { type: String }, // Visual, Auditory, etc.
        interests: [{ type: String }] // Array of strings
    },

    // Settings
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        twoFactorEnabled: { type: Boolean, default: false },
        privacy: { type: String, enum: ['public', 'private'], default: 'public' }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
