import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./backend/models/job.model.js";
import { Notification } from "./backend/models/notification.model.js";
import { checkExpiredJobs } from "./backend/controllers/job.controller.js";

dotenv.config({ path: "./backend/.env" });

const runCheck = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB for manual check.");

        console.log("--- STARTING MANUAL EXPIRY CHECK ---");
        await checkExpiredJobs();
        console.log("--- CHECK COMPLETED ---");

        process.exit(0);
    } catch (error) {
        console.error("Check failed:", error);
        process.exit(1);
    }
};

runCheck();
