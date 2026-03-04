import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'accepted', 'rejected', 'screening', 'screened', 'interview scheduled', 'interviewed', 'offer extended', 'offer accepted'],
        default: 'applied'
    },
    statusHistory: [
        {
            status: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    aiScore: {
        type: Number,
        default: 0
    },
    scoreBreakdown: {
        skills: { type: Number, default: 0 },
        experience: { type: Number, default: 0 },
        education: { type: Number, default: 0 },
        profile: { type: Number, default: 0 }
    },
    resumeText: {
        type: String
    },
    // New fields for AI Insights
    matchingSkills: [String],
    missingSkills: [String],
    strengthAreas: [String],
    gapInsights: String,
    improvementTips: [String],
    predictedRole: String,
    experience: String,
    education: String,
    certifications: [String]
}, { timestamps: true });
export const Application = mongoose.model("Application", applicationSchema);