import mongoose from "mongoose";
import { Job } from "./models/job.model.js";
import dotenv from "dotenv";

dotenv.config();

const updateExperienceLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs to update...`);

        for (const job of jobs) {
            const newExp = Math.floor(Math.random() * 3); // 0, 1, or 2 years
            await Job.findByIdAndUpdate(job._id, { experienceLevel: newExp });
        }

        console.log(`Successfully updated experience levels for all jobs to 0-2 years.`);
        process.exit(0);
    } catch (error) {
        console.error("Error updating experience levels:", error);
        process.exit(1);
    }
};

updateExperienceLevels();
