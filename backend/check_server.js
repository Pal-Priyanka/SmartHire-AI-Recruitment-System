import axios from 'axios';

const checkVersion = async () => {
    try {
        // Just a dummy request to see if we can get an applicant's data
        // We'll need a valid job ID from the seed data
        const res = await axios.get('http://localhost:5000/api/v1/application/applicants/65...something'); // This is just a guess
        console.log("Server is reachable.");
    } catch (e) {
        console.log("Health check failed or route requires auth.");
    }
};

checkVersion();
