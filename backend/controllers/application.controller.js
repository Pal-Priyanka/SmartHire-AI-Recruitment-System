import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";
import { extractRawText, parseResume } from "../services/resumeParser.js";
import { generateMatchInsights } from "../services/nlp.service.js";
import { sendStatusUpdate } from "../services/emailService.js";
import { Interview } from "../models/interview.model.js";
import path from "path";
import fs from "fs";

export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            })
        };
        // check if the user has already applied for the job
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });

        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this jobs",
                success: false
            });
        }

        // check if the jobs exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                success: false
            })
        }
        // Fetch user for skills comparison
        const user = await User.findById(userId);

        // --- Resume Parsing & AI Scoring (Unified logic) ---
        let resumeText = "";
        let parsedData = {};
        if (user?.profile?.resume) {
            try {
                resumeText = await extractRawText(user.profile.resume);
                parsedData = await parseResume(user.profile.resume) || {};
            } catch (parseError) {
                console.error("Error during resume parsing in application:", parseError);
            }
        }

        const insights = generateMatchInsights(
            resumeText,
            {
                title: job.title,
                description: job.description,
                requirements: job.requirements
            },
            parsedData,
            user
        );

        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            aiScore: insights.score,
            scoreBreakdown: insights.scoreBreakdown,
            resumeText: resumeText,
            // Detailed insights from the NLP engine
            matchingSkills: insights.matchingSkills,
            missingSkills: insights.missingSkills,
            strengthAreas: insights.strengthAreas,
            gapInsights: insights.gapInsights,
            improvementTips: insights.improvementTips,
            predictedRole: insights.predictedRole,
            experience: insights.experience,
            education: insights.education,
            certifications: insights.certifications
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Applied successfully. Your AI Score: " + insights.score + "%",
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
            path: 'job',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'company',
                options: { sort: { createdAt: -1 } },
            }
        });
        if (!application) {
            return res.status(404).json({
                message: "No Applications",
                success: false
            })
        };
        return res.status(200).json({
            application,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant',
                select: 'fullname email phoneNumber profile' // Explicitly select profile
            }
        });
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            })
        };

        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getAllApplicants = async (req, res) => {
    try {
        const recruiterId = req.id;
        const jobs = await Job.find({ created_by: recruiterId });
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .populate({
                path: 'applicant',
                select: '-password'
            })
            .populate('job');

        if (!applications) {
            return res.status(404).json({
                message: 'No applicants found.',
                success: false
            });
        }

        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            })
        };

        // find the application by applicantion id
        const application = await Application.findOne({ _id: applicationId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            })
        };

        // update the status
        const normalizedStatus = status.toLowerCase();
        application.status = normalizedStatus;
        if (!application.statusHistory) application.statusHistory = [];
        application.statusHistory.push({ status: normalizedStatus, timestamp: new Date() });

        await application.save();

        // Notify the candidate
        await createNotification(
            application.applicant,
            'application_status',
            'Application Status Updated',
            `Your application status for a job has been updated to ${status}.`,
            `/profile`
        );

        // --- Send Email Notification (Task 2.3) ---
        try {
            const enrichedApp = await Application.findById(applicationId).populate('applicant').populate('job');
            if (enrichedApp?.applicant?.email) {
                await sendStatusUpdate(
                    enrichedApp.applicant.email,
                    enrichedApp.applicant.fullname,
                    enrichedApp.job?.title || "Applied Position",
                    status
                );
            }

            // --- Auto-Schedule Interview (New Task) ---
            if (status.toLowerCase() === 'accepted') {
                const existingInterview = await Interview.findOne({ application: applicationId });
                if (!existingInterview) {
                    // Schedule for 2 days from now at 10:00 AM
                    const date = new Date();
                    date.setDate(date.getDate() + 2);
                    const dateStr = date.toISOString().split('T')[0];

                    await Interview.create({
                        application: applicationId,
                        candidate: application.applicant,
                        job: application.job,
                        interviewer: enrichedApp.job.created_by,
                        scheduledDate: dateStr,
                        scheduledTime: "10:00 AM",
                        type: 'Technical',
                        format: 'Video',
                        status: 'scheduled',
                        notes: 'Auto-scheduled upon application acceptance.'
                    });

                    console.log(`Auto-scheduled interview for application ${applicationId}`);
                }
            }
        } catch (error) {
            console.error("Error in post-status update logic:", error);
        }

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const withdrawApplication = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;

        const application = await Application.findOne({ job: jobId, applicant: userId });
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // Remove application from Job's applications array
        await Job.findByIdAndUpdate(jobId, {
            $pull: { applications: application._id }
        });

        // Delete the application
        await Application.findByIdAndDelete(application._id);

        return res.status(200).json({
            message: "Application withdrawn successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};