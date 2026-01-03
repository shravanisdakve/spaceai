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
    bio: { type: String, maxLength: 500 }, // Increased limit
    location: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String },
    website: { type: String },
    socials: {
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String }
    },
    timezone: { type: String },
    pronouns: { type: String },

    // Education
    university: { type: String },
    degree: { type: String }, // e.g. "B.S. Computer Science"
    yearOfStudy: { type: String }, // e.g. "Sophomore", "3rd Year"
    fieldOfStudy: { type: String },
    academicGoals: { type: String },
    gpa: { type: String },
    expectedGraduation: { type: Date },
    focusAreas: [{ type: String }],
    languages: [{ type: String }], // Human languages proficient in

    // Preferences
    preferences: {
        studyLanguage: { type: String, default: "English" },
        theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
        learningPace: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
        learningStyle: { type: String }, // Visual, Auditory, etc.
        interests: [{ type: String }], // Array of strings
        studyDuration: { type: Number, default: 60 }, // minutes
        notificationFrequency: { type: String, enum: ['Daily', 'Weekly', 'As-needed'], default: 'Daily' },
        videoSpeed: { type: Number, default: 1.0 },
        fontSize: { type: String, default: 'medium' }
    },

    // Settings & Privacy
    settings: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true },
            studyReminders: { type: Boolean, default: true },
            streakAlerts: { type: Boolean, default: true }
        },
        twoFactorEnabled: { type: Boolean, default: false },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
            showGPA: { type: Boolean, default: false },
            showActivity: { type: Boolean, default: true }
        }
    },

    // Gamification
    stats: {
        totalStudyHours: { type: Number, default: 0 },
        studyStreak: { type: Number, default: 0 },
        quizzesCompleted: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        points: { type: Number, default: 0 }
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
