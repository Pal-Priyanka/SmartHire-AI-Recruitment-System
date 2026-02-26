import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId, applyBy } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            applyBy: applyBy || null,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: "applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error.",
            success: false
        });
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company',
            createdAt: -1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, applyBy } = req.body;
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this job", success: false });
        }

        const updateData = {
            title,
            description,
            requirements: requirements?.split(","),
            salary: Number(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            applyBy: applyBy || job.applyBy
        };

        const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, { new: true });
        return res.status(200).json({ message: "Job updated successfully", job: updatedJob, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found", success: false });
        }

        if (job.created_by.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this job", success: false });
        }

        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({ message: "Job deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error while deleting job", success: false });
    }
};

import { createNotification } from "./notification.controller.js";
import { Notification } from "../models/notification.model.js";

const checkExpiredJobs = async () => {
    try {
        const now = new Date();
        const expiredJobs = await Job.find({
            applyBy: { $lte: now },
            status: 'active'
        });

        for (const job of expiredJobs) {
            // Check if notification already sent to avoid duplicates
            const existingNotification = await Notification.findOne({
                recipient: job.created_by,
                'data.jobId': job._id,
                type: 'job_expiry'
            });

            if (!existingNotification) {
                await createNotification(
                    job.created_by,
                    'job_expiry',
                    `Job Deadline Passed: ${job.title}`,
                    `Deadline for "${job.title}" has passed. Confirm deletion or sustain with a new deadline.`,
                    "",
                    { jobId: job._id, jobTitle: job.title }
                );
            }
        }
    } catch (error) {
        console.error("Error in checkExpiredJobs:", error);
    }
};

// Check every 1 minute
setInterval(checkExpiredJobs, 60 * 1000);
