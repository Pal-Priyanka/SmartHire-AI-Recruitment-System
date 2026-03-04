import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";
import { Notification } from "../models/notification.model.js";
import { generateMatchInsights } from "../services/nlp.service.js";
import { extractRawText, parseResume } from "../services/resumeParser.js";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename_controller = fileURLToPath(import.meta.url);
const __dirname_controller = path.dirname(__filename_controller);

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
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getJobMatch = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.id;

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Strict Resume Dependency: Analysis requires a resume file
        if (!user.profile.resume) {
            return res.status(400).json({
                message: "Analysis requires a resume. Please upload your resume first.",
                success: false
            });
        }

        let resumeText = "";
        let parsedData = {};

        try {
            // Use the robust extractRawText which handles both URLs and local paths
            resumeText = await extractRawText(user.profile.resume);
            // Also attempt to get structured data (Education, Experience) for the breakdown
            parsedData = await parseResume(user.profile.resume) || {};
        } catch (parseError) {
            console.error("Resume parsing error in getJobMatch:", parseError.message);
        }

        // Fallback: if parsing fails or returns empty, use basic profile info
        if (!resumeText || resumeText.trim().length === 0) {
            const fallbackParts = [];
            if (user.profile.resumeOriginalName) fallbackParts.push(user.profile.resumeOriginalName);
            if (user.profile.skills && user.profile.skills.length > 0) {
                fallbackParts.push(user.profile.skills.join(' '));
            }
            if (user.profile.bio) fallbackParts.push(user.profile.bio);
            resumeText = fallbackParts.join(' ');
        }

        // Combine semantic match insights + structured breakdown
        const insights = generateMatchInsights(resumeText, job, parsedData, user);

        return res.status(200).json({
            insights,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

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

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (requirements !== undefined) updateData.requirements = requirements?.split(",");
        if (salary !== undefined) updateData.salary = Number(salary);
        if (location !== undefined) updateData.location = location;
        if (jobType !== undefined) updateData.jobType = jobType;
        if (experience !== undefined) updateData.experienceLevel = experience;
        if (position !== undefined) updateData.position = position;
        if (applyBy !== undefined) updateData.applyBy = applyBy;

        const updatedJob = await Job.findByIdAndUpdate(jobId, { $set: updateData }, { new: true });
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

        // Cascade: delete all applications for this job
        const { Application } = await import("../models/application.model.js");
        await Application.deleteMany({ job: jobId });

        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({ message: "Job and associated applications deleted successfully", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error while deleting job", success: false });
    }
};



export const checkExpiredJobs = async () => {
    try {
        const now = new Date();
        const expiredJobs = await Job.find({
            applyBy: { $lte: now },
            status: 'active'
        }).populate('company');

        // Debug: Log total active jobs with deadlines
        const allPendingJobs = await Job.find({ applyBy: { $ne: null }, status: 'active' });
        console.log(`[ExpiryCheck] Found ${expiredJobs.length} expired jobs out of ${allPendingJobs.length} pending jobs.`);
        if (allPendingJobs.length > 0 && expiredJobs.length === 0) {
            console.log(`[ExpiryCheck] Next deadline: ${Math.min(...allPendingJobs.map(j => j.applyBy))}`);
        }

        if (expiredJobs.length > 0) {
            console.log(`[ExpiryCheck] Found ${expiredJobs.length} expired jobs.`);
        }

        for (const job of expiredJobs) {
            const companyName = job.company?.name || "Unknown Company";
            const deadlineDate = job.applyBy;
            const deadlineStr = deadlineDate.toISOString();
            const jobIdStr = job._id.toString();

            console.log(`[ExpiryCheck] Processing: "${job.title}" | ID: ${jobIdStr} | Deadline: ${deadlineStr} | Now: ${now.toISOString()}`);

            // Check for existing notification with strict matching
            const query = {
                recipient: job.created_by,
                'data.jobId': job._id,
                'data.deadline': deadlineStr,
                type: 'job_expiry'
            };

            const existingNotification = await Notification.findOne(query);

            if (!existingNotification) {
                console.log(`[ExpiryCheck] NO notification found for ID ${jobIdStr} and deadline ${deadlineStr}. Sending NEW.`);
                await createNotification(
                    job.created_by,
                    'job_expiry',
                    `Job Deadline Passed: ${job.title} (${companyName})`,
                    `Deadline for "${job.title}" at ${companyName} has passed. Confirm deletion or sustain with a new deadline.`,
                    "",
                    { jobId: job._id, jobTitle: job.title, companyName: companyName, deadline: deadlineStr }
                );
            } else {
                console.log(`[ExpiryCheck] ALREADY NOTIFIED for ID ${jobIdStr} and deadline ${deadlineStr}. Skipping.`);

                // Extra check: if unread but missing company name, update it
                if (!existingNotification.isRead && !existingNotification.title.includes(companyName)) {
                    console.log(`[ExpiryCheck] Refreshing existing unread notification with company name.`);
                    existingNotification.title = `Job Deadline Passed: ${job.title} (${companyName})`;
                    existingNotification.message = `Deadline for "${job.title}" at ${companyName} has passed. Confirm deletion or sustain with a new deadline.`;
                    existingNotification.data = { ...existingNotification.data, companyName };
                    await existingNotification.save();
                }
            }
        }
    } catch (error) {
        console.error("Error in checkExpiredJobs:", error);
    }
};

