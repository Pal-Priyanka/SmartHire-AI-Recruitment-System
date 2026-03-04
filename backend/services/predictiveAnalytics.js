import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

/**
 * Predictive Analytics Service
 * Calculates "Time to Fill" forecasts based on historical hiring data.
 */

const CATEGORY_MAP = {
    'Frontend': ['react', 'vue', 'angular', 'frontend', 'ui', 'ux'],
    'Backend': ['node', 'java', 'python', 'backend', 'golang', 'ruby', 'c#', '.net'],
    'FullStack': ['fullstack', 'full stack', 'mern', 'mean'],
    'Data Science': ['data', 'analytics', 'ml', 'ai', 'intelligence'],
    'DevOps': ['devops', 'aws', 'cloud', 'azure', 'docker', 'kubernetes', 'sre'],
    'Mobile': ['mobile', 'android', 'ios', 'react native', 'flutter']
};

const SEED_DATA = {
    'Frontend': 14,
    'Backend': 18,
    'FullStack': 21,
    'Data Science': 25,
    'DevOps': 15,
    'Mobile': 16,
    'Generic': 14
};

const getCategoryFromTitle = (title) => {
    const lowerTitle = title.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(keyword => lowerTitle.includes(keyword))) {
            return category;
        }
    }
    return 'Generic';
};

export const calculateTimeToFillForecast = async (userId) => {
    try {
        // 1. Fetch closed jobs created by this recruiter
        const closedJobs = await Job.find({ 
            created_by: userId, 
            status: 'closed' 
        }).populate('applications');

        const categoryStats = {};

        // 2. Process each closed job to find the "Time to Fill"
        for (const job of closedJobs) {
            const category = getCategoryFromTitle(job.title);
            
            // Find application that successfully filled the role (offer accepted)
            const successfulApp = await Application.findOne({ 
                job: job._id, 
                status: 'offer accepted' 
            });

            if (successfulApp && successfulApp.statusHistory) {
                const offerAcceptedEntry = successfulApp.statusHistory.find(h => h.status === 'offer accepted');
                if (offerAcceptedEntry) {
                    const daysToFill = Math.ceil((new Date(offerAcceptedEntry.timestamp) - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
                    
                    if (!categoryStats[category]) categoryStats[category] = [];
                    categoryStats[category].push(daysToFill);
                }
            }
        }

        // 3. Aggregate results and blend with seed data for forecasting
        const forecast = Object.keys(SEED_DATA).map(category => {
            const historicalData = categoryStats[category] || [];
            const avgHistorical = historicalData.length > 0 
                ? historicalData.reduce((a, b) => a + b, 0) / historicalData.length 
                : SEED_DATA[category];

            // Simple weighted moving average (70% seed / standard, 30% real data if available)
            // As more data comes in, the real data influence can grow.
            const result = historicalData.length > 3 
                ? Math.round(avgHistorical) // High confidence in real data
                : Math.round((SEED_DATA[category] * 0.7) + (avgHistorical * 0.3));

            return {
                category,
                averageDays: result,
                dataPoints: historicalData.length,
                status: historicalData.length > 2 ? 'High Confidence' : 'Predictive'
            };
        });

        return forecast;
    } catch (error) {
        console.error("Predictive Analytics Error:", error);
        return Object.keys(SEED_DATA).map(category => ({
            category,
            averageDays: SEED_DATA[category],
            dataPoints: 0,
            status: 'Seed Data'
        }));
    }
};
