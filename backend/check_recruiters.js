import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    role: String
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function checkRecruiters() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to MongoDB');

        const recruiters = await User.find({ role: 'recruiter' });
        console.log(`Found ${recruiters.length} recruiters:`);
        recruiters.forEach(r => {
            console.log(`- ${r.fullname} (${r.email}) [Role: ${r.role}]`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkRecruiters();
