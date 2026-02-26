import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Job } from './backend/models/job.model.js';

dotenv.config({ path: './backend/.env' });

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const now = new Date();
        const expiredJobs = await Job.find({
            applyBy: { $lte: now },
            status: 'active'
        });
        console.log(`Now: ${now}`);
        console.log(`Found ${expiredJobs.length} expired jobs.`);
        expiredJobs.forEach(job => {
            console.log(`Job: ${job.title}, ApplyBy: ${job.applyBy}, CreatedBy: ${job.created_by}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDb();
