import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Interview } from "../models/interview.model.js";
import { calculateTimeToFillForecast } from "../services/predictiveAnalytics.js";

export const getRecruiterAnalytics = async (req, res) => {
    try {
        const userId = req.id;

        const totalJobs = await Job.countDocuments({ created_by: userId });
        const activeJobs = await Job.countDocuments({ created_by: userId, status: 'active' });

        const jobs = await Job.find({ created_by: userId }).select("_id");
        const jobIds = jobs.map(j => j._id);

        const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });

        const applications = await Application.find({ job: { $in: jobIds } });
        const statusDistribution = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        const averageAiScore = applications.length > 0
            ? (applications.reduce((sum, app) => sum + (app.aiScore || 0), 0) / applications.length).toFixed(1)
            : 0;

        const upcomingInterviews = await Interview.countDocuments({
            interviewer: userId,
            status: 'scheduled',
            scheduledDate: { $gte: new Date().toISOString().split('T')[0] }
        });

        return res.status(200).json({
            analytics: {
                totalJobs,
                activeJobs,
                totalApplications,
                statusDistribution,
                averageAiScore,
                upcomingInterviews
            },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getCandidateAnalytics = async (req, res) => {
    try {
        const userId = req.id;

        const totalApplied = await Application.countDocuments({ applicant: userId });
        const interviewScheduled = await Application.countDocuments({ applicant: userId, status: 'interview scheduled' });

        const applications = await Application.find({ applicant: userId });
        const statusCounts = applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {});

        const avgScore = applications.length > 0
            ? (applications.reduce((sum, app) => sum + (app.aiScore || 0), 0) / applications.length).toFixed(1)
            : 0;

        return res.status(200).json({
            analytics: {
                totalApplied,
                interviewScheduled,
                statusCounts,
                avgScore
            },
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const getForecastAnalytics = async (req, res) => {
    try {
        const userId = req.id;
        const forecast = await calculateTimeToFillForecast(userId);
        
        return res.status(200).json({
            forecast,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
