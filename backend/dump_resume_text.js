import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import { extractRawText } from './services/resumeParser.js';
import dotenv from 'dotenv';
dotenv.config();

async function debugText() {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ "profile.resume": { $exists: true, $ne: "" } }).sort({ updatedAt: -1 });
    if (!user) {
        console.log("No resume user found.");
        process.exit(0);
    }
    console.log(`Analyzing resume for: ${user.fullname}`);
    const text = await extractRawText(user.profile.resume);
    console.log("--- START RAW TEXT ---");
    console.log(text);
    console.log("--- END RAW TEXT ---");
    process.exit(0);
}
debugText();
