import mongoose from 'mongoose';
import { User } from './models/user.model.js';
import cloudinary from './utils/cloudinary.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixResumes() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ "profile.resume": { $exists: true, $ne: "" } });

    console.log(`Found ${users.length} users with resumes.`);
    for (const user of users) {
        try {
            const url = user.profile.resume;
            const publicId = url.split('/').pop().split('.')[0];
            console.log(`Fixing for: ${user.fullname} (${publicId})...`);

            // Explicitly set access mode to public if it was restricted
            await cloudinary.uploader.explicit(publicId, {
                type: 'upload',
                resource_type: 'image',
                access_mode: 'public'
            });
            console.log("SUCCESS! Resource made public.");
        } catch (err) {
            console.error(`FAILED for ${user.fullname}:`, err.message);
        }
    }
    process.exit(0);
}
fixResumes();
