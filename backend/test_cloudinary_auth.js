import axios from 'axios';
import dotenv from 'dotenv';
import cloudinary from './utils/cloudinary.js';
dotenv.config();

const url = "https://res.cloudinary.com/dx2b2lwwi/image/upload/v1740837230/embhnaewpcykkjwwxcir";

async function testCloudinaryAccess() {
    try {
        console.log("Testing with Basic Auth...");
        const auth = Buffer.from(process.env.API_KEY + ":" + process.env.API_SECRET).base64; // wait, base64 is not a property
        const authHeader = 'Basic ' + Buffer.from(process.env.API_KEY + ':' + process.env.API_SECRET).toString('base64');

        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'Authorization': authHeader }
        });
        console.log("SUCCESS! Basic Auth worked. Buffer length:", res.data.byteLength);
        process.exit(0);
    } catch (err) {
        console.log("Basic Auth FAILED. Status:", err.response?.status);

        try {
            console.log("\nTesting via SDK (api.resource)...");
            // Public ID is the last part of the URL (after v.../)
            const publicId = url.split('/').pop();
            const resource = await cloudinary.api.resource(publicId);
            console.log("Resource found! URL:", resource.secure_url);

            // Try downloading it with signed URL if needed
            // But let's see if the resource info gives us clues.
        } catch (sdkErr) {
            console.log("SDK check failed:", sdkErr.message);
        }
        process.exit(1);
    }
}
testCloudinaryAccess();
