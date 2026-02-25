import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    interviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduledDate: {
        type: String, // Or Date
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // minutes
        default: 60
    },
    type: {
        type: String,
        enum: ['Technical', 'HR', 'Cultural', 'Final'],
        required: true
    },
    format: {
        type: String,
        enum: ['Video', 'Phone', 'In-Person'],
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String
    },
    meetLink: {
        type: String
    }
}, { timestamps: true });

export const Interview = mongoose.model("Interview", interviewSchema);
