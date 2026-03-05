import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./models/job.model.js";

dotenv.config();

const beginnerTitles = [
    "Junior",
    "Associate",
    "Intern",
    "Entry Level",
    "Graduate"
];

const updateToBeginner = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for beginner refocus...");

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs to refocus.`);

        for (const job of jobs) {
            let newTitle = job.title;

            // Avoid double prefixing
            const alreadyBeginner = beginnerTitles.some(prefix => newTitle.toLowerCase().includes(prefix.toLowerCase()));

            if (!alreadyBeginner) {
                const randomPrefix = beginnerTitles[Math.floor(Math.random() * 3)]; // Use Junior, Associate, or Intern
                newTitle = `${randomPrefix} ${job.title}`;
            }

            // Strictly 0-1 years for "Beginner"
            const newExperience = Math.floor(Math.random() * 2);

            // Set job type to Internship or Full-time (Entry Level)
            const newJobType = newExperience === 0 ? "Internship" : "Full-time (Entry Level)";

            const updateData = {
                title: newTitle,
                experienceLevel: newExperience,
                jobType: newJobType,
                description: `[BEGINNER FRIENDLY] ${job.description}\n\nThis role is specifically designed for early-career professionals and students. We value potential, curiosity, and a strong foundation over years of experience.`
            };

            await Job.findByIdAndUpdate(job._id, updateData);
        }

        console.log("Successfully refocused all jobs to beginner level!");
        process.exit(0);
    } catch (error) {
        console.error("Error during refocus:", error);
        process.exit(1);
    }
};

updateToBeginner();
