import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['candidate', 'recruiter'],
        required: true
    },
    profile: {
        bio: { type: String },
        skills: [{ type: String }],
        resume: { type: String }, // URL to resume file
        resumeOriginalName: { type: String },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        experience: { type: Number, default: 0 },
        education: { type: String, default: "" },
        certifications: [{ type: String }],
        profilePhoto: {
            type: String,
            default: ""
        },
        bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
    },
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);