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

async function checkRestoredRecruiters() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/smarthire');
        console.log('Connected to Restored MongoDB');

        const recruiters = await User.find({ role: 'recruiter' });
        console.log(`Found ${recruiters.length} recruiters:`);
        recruiters.forEach(r => {
            console.log(`- ${r.fullname} (${r.email}) [Role: ${r.role}]`);
        });

        if (recruiters.length === 0) {
            const allUsers = await User.find({}).limit(5);
            console.log('No recruiters found. Sample users:');
            allUsers.forEach(u => console.log(`- ${u.fullname} (${u.email}) [Role: ${u.role}]`));
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkRestoredRecruiters();
