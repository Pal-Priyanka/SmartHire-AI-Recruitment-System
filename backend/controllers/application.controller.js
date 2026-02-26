import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

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

        // Calculate AI Score (Mock logic for SmartHire experience)
        // Match user skills with job requirements
        const userSkills = user?.profile?.skills || [];
        const jobRequirements = job?.requirements || [];

        let matchCount = 0;
        if (jobRequirements.length > 0) {
            jobRequirements.forEach(req => {
                if (userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))) {
                    matchCount++;
                }
            });
        }

        const skillMatchPercentage = jobRequirements.length > 0 ? (matchCount / jobRequirements.length) * 100 : 50;
        const randomBonus = Math.floor(Math.random() * 20); // Add some variability
        const finalScore = Math.min(100, Math.round(skillMatchPercentage + randomBonus));

        // create a new application
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
            aiScore: finalScore,
            scoreBreakdown: {
                skills: Math.round(skillMatchPercentage),
                experience: Math.min(100, (user?.profile?.experience || 1) * 10),
                education: 80,
                profile: 90
            }
        });

        job.applications.push(newApplication._id);
        await job.save();

        return res.status(201).json({
            message: "Applied successfully. Your AI Score: " + finalScore + "%",
            success: true
        })
    } catch (error) {
        console.log(error);
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
                path: 'applicant'
            }
        });
        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            })
        };

        const jobObj = job.toObject();

        // Ensure all applications have an AI Score for the high-end demo experience
        const enrichedApplications = jobObj.applications.map(app => {
            if (!app.aiScore || app.aiScore === 0) {
                // Dynamic fallback score based on skills vs requirements
                const userSkills = app.applicant?.profile?.skills || [];
                const jobRequirements = jobObj.requirements || [];

                let matchCount = 0;
                if (jobRequirements.length > 0) {
                    jobRequirements.forEach(req => {
                        if (userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))) {
                            matchCount++;
                        }
                    });
                }

                const baseScore = jobRequirements.length > 0 ? (matchCount / jobRequirements.length) * 100 : 75;
                app.aiScore = Math.min(98, Math.round(baseScore + (Math.random() * 15)));
            }
            return app;
        });

        return res.status(200).json({
            job: { ...jobObj, applications: enrichedApplications },
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}

export const getAllApplicants = async (req, res) => {
    try {
        const recruiterId = req.id;
        const jobs = await Job.find({ createdBy: recruiterId });
        const jobIds = jobs.map(j => j._id);

        const applications = await Application.find({ job: { $in: jobIds } })
            .sort({ createdAt: -1 })
            .populate('applicant')
            .populate('job');

        if (!applications) {
            return res.status(404).json({
                message: 'No applicants found.',
                success: false
            });
        }

        const enrichedApplications = applications.map(app => {
            const appObj = app.toObject();
            if (!appObj.aiScore || appObj.aiScore === 0) {
                const userSkills = appObj.applicant?.profile?.skills || [];
                const jobRequirements = appObj.job?.requirements || [];
                let matchCount = 0;
                if (jobRequirements.length > 0) {
                    jobRequirements.forEach(req => {
                        if (userSkills.some(skill => skill.toLowerCase().includes(req.toLowerCase()))) {
                            matchCount++;
                        }
                    });
                }
                const baseScore = jobRequirements.length > 0 ? (matchCount / jobRequirements.length) * 100 : 75;
                appObj.aiScore = Math.min(98, Math.round(baseScore + (Math.random() * 15)));
            }
            return appObj;
        });

        return res.status(200).json({
            applications: enrichedApplications,
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
        application.status = status.toLowerCase();
        await application.save();

        // Notify the candidate
        await createNotification(
            application.applicant,
            'application',
            'Application Status Updated',
            `Your application status for a job has been updated to ${status}.`,
            '/profile'
        );

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });

    } catch (error) {
        console.log(error);
    }
}