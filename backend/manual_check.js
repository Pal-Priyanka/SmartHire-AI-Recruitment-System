import mongoose from "mongoose";
import dotenv from "dotenv";
import { Job } from "./models/job.model.js";
import { Notification } from "./models/notification.model.js";
import { Company } from "./models/company.model.js";
import { User } from "./models/user.model.js"; // Register the User schema
import { checkExpiredJobs } from "./controllers/job.controller.js";

dotenv.config({ path: "./.env" });

const testRecurring = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB.");

        // 1. Cleanup old test data
        await Job.deleteMany({ title: "RECURRING_TEST_JOB" });
        await Notification.deleteMany({ title: /RECURRING_TEST_JOB/ });

        // 2. Find a recruiter
        const someAdmin = await User.findOne({ role: 'recruiter' });
        const someCompany = await Company.findOne();

        if (!someAdmin || !someCompany) {
            console.log("Need at least one recruiter and one company in DB to test.");
            process.exit(0);
        }

        console.log("Using Admin:", someAdmin.email, "and Company:", someCompany.name);

        // 3. Create a job with a past deadline
        const deadline1 = new Date(Date.now() - 100000); // 100s ago
        const job = await Job.create({
            title: "RECURRING_TEST_JOB",
            description: "Test description",
            requirements: ["Node.js"],
            salary: 10,
            location: "Remote",
            jobType: "Full-time",
            experienceLevel: 2,
            position: 1,
            company: someCompany._id,
            created_by: someAdmin._id,
            applyBy: deadline1,
            status: 'active'
        });
        const deadline1Str = deadline1.toISOString();
        console.log("Created job with deadline:", deadline1Str);

        // 4. Run first check
        console.log("--- RUNNING CHECK 1 ---");
        await checkExpiredJobs();

        const count1 = await Notification.countDocuments({
            'data.jobId': job._id,
            'data.deadline': deadline1Str
        });
        console.log("Notifications for deadline 1 after check 1:", count1);
        if (count1 !== 1) throw new Error("Expected 1 notification for deadline 1");

        // 5. Simulate "Sustain" - Update deadline to another past time
        const deadline2 = new Date(Date.now() - 50000); // 50s ago
        const deadline2Str = deadline2.toISOString();
        job.applyBy = deadline2;
        await job.save();
        console.log("Sustained job with NEW deadline:", deadline2Str);

        // 6. Run second check
        console.log("--- RUNNING CHECK 2 ---");
        await checkExpiredJobs();

        const count2 = await Notification.countDocuments({
            'data.jobId': job._id,
            'data.deadline': deadline2Str
        });
        console.log("Notifications for deadline 2 after check 2:", count2);
        if (count2 !== 1) throw new Error("Expected 1 notification for deadline 2 (recurring)");

        const totalCount = await Notification.countDocuments({ 'data.jobId': job._id });
        console.log("Total notifications for this job:", totalCount);
        if (totalCount !== 2) throw new Error("Expected 2 total notifications after second check");

        console.log("SUCCESS: Recurring notifications work!");

        // Cleanup
        await Job.deleteMany({ title: "RECURRING_TEST_JOB" });
        await Notification.deleteMany({ title: /RECURRING_TEST_JOB/ });

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

testRecurring();
