import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { parseResume, extractRawText } from './services/resumeParser.js';
import dotenv from 'dotenv';

dotenv.config();

async function auditParser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Find any user to see what roles exist
        const users = await User.find().sort({ updatedAt: -1 }).limit(5);

        if (users.length === 0) {
            console.log("No users found at all in DB.");
            process.exit(0);
        }

        users.forEach(user => {
            console.log(`\n--- USER: ${user.fullname} (${user.email}) [${user.role}] ---`);
            console.log(`Resume URL: ${user.profile.resume || "NONE"}`);
            console.log(`Experience: ${user.profile.experience}`);
            console.log(`Education: ${user.profile.education}`);
            console.log(`Certifications: ${JSON.stringify(user.profile.certifications)}`);
            console.log(`Updated At: ${user.updatedAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

auditParser();
