import { Job } from "../models/job.model.js";
import { createNotification } from "./notification.controller.js";
import { Notification } from "../models/notification.model.js";

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
            console.log(`[ExpiryCheck] Processing expired job: ${job.title} at ${companyName} (${job._id})`);

            // Check if notification already sent to avoid duplicates
            const existingNotification = await Notification.findOne({
                recipient: job.created_by,
                'data.jobId': job._id,
                type: 'job_expiry'
            });

            if (!existingNotification) {
                console.log(`[ExpiryCheck] Sending notification to ${job.created_by} for job ${job._id} at ${companyName}`);
                await createNotification(
                    job.created_by,
                    'job_expiry',
                    `Job Deadline Passed: ${job.title} (${companyName})`,
                    `Deadline for "${job.title}" at ${companyName} has passed. Confirm deletion or sustain with a new deadline.`,
                    "",
                    { jobId: job._id, jobTitle: job.title, companyName: companyName }
                );
            } else {
                console.log(`[ExpiryCheck] Notification already exists for job ${job._id}`);
            }
        }
    } catch (error) {
        console.error("Error in checkExpiredJobs:", error);
    }
};

