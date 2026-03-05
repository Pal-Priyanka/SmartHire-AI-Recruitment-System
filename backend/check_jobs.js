import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./models/job.model.js";

dotenv.config();

const checkJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const jobs = await Job.find({}, 'title');
        console.log("Current Jobs in Database:");
        jobs.forEach(j => console.log(`- ${j._id}: ${j.title}`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkJobs();
