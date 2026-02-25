import { Interview } from "../models/interview.model.js";
import { Application } from "../models/application.model.js";
import { createNotification } from "./notification.controller.js";

export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, candidateId, jobId, scheduledDate, scheduledTime, duration, type, format, notes, meetLink } = req.body;
        const recruiterId = req.id;

        if (!applicationId || !candidateId || !jobId || !scheduledDate || !scheduledTime || !type || !format) {
            return res.status(400).json({ message: "Missing required fields", success: false });
        }

        // Conflict Detection
        const conflictingInterviews = await Interview.find({
            candidate: candidateId,
            scheduledDate: scheduledDate,
            status: 'scheduled'
        });

        const newStart = new Date(`${scheduledDate} ${scheduledTime}`);
        const newEnd = new Date(newStart.getTime() + (duration || 60) * 60000);

        const hasConflict = conflictingInterviews.some(existing => {
            const existingStart = new Date(`${existing.scheduledDate} ${existing.scheduledTime}`);
            const existingEnd = new Date(existingStart.getTime() + (existing.duration || 60) * 60000);

            // Overlap check (including 30 min buffer)
            const waitBuffer = 30 * 60000;
            return (newStart < existingEnd + waitBuffer && newEnd + waitBuffer > existingStart);
        });

        if (hasConflict) {
            return res.status(409).json({ message: "Time slot conflict detected for this candidate", success: false });
        }

        const interview = await Interview.create({
            application: applicationId,
            candidate: candidateId,
            job: jobId,
            interviewer: recruiterId,
            scheduledDate,
            scheduledTime,
            duration,
            type,
            format,
            notes,
            meetLink
        });

        // Update application status
        await Application.findByIdAndUpdate(applicationId, {
            status: 'interview scheduled',
            $push: { statusHistory: { status: 'interview scheduled' } }
        });

        // Create notification for candidate
        await createNotification(
            candidateId,
            'interview',
            'Interview Scheduled!',
            `You have a new ${type} interview scheduled for ${scheduledDate} at ${scheduledTime}.`,
            `/profile`
        );

        return res.status(201).json({ message: "Interview scheduled successfully", interview, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getRecruiterInterviews = async (req, res) => {
    try {
        const userId = req.id;
        const interviews = await Interview.find({ interviewer: userId })
            .populate("candidate", "fullname email")
            .populate("job", "title")
            .sort({ scheduledDate: 1, scheduledTime: 1 });
        return res.status(200).json({ interviews, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getCandidateInterviews = async (req, res) => {
    try {
        const userId = req.id;
        const interviews = await Interview.find({ candidate: userId })
            .populate("job", "title")
            .populate("interviewer", "fullname")
            .sort({ scheduledDate: 1, scheduledTime: 1 });
        return res.status(200).json({ interviews, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const updateInterviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const interviewId = req.params.id;

        const interview = await Interview.findByIdAndUpdate(interviewId, { status }, { new: true });
        if (!interview) return res.status(404).json({ message: "Interview not found", success: false });

        return res.status(200).json({ message: `Interview status updated to ${status}`, interview, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
