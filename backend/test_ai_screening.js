import { computeScore } from './services/aiScreening.js';

const resumeText = `
Jane Smith
Data Scientist with 3 years of experience.
Expertise in Python, Machine Learning, TensorFlow, and SQL.
Education: Master of Science in Data Science.
`;

const candidateProfile = {
    skills: ["Python", "Machine Learning", "SQL"],
    yearsOfExperience: 3
};

const jobRequirements = {
    description: "Looking for a Data Scientist with 3+ years of experience in Python and ML.",
    requirements: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    experienceLevel: 3
};

console.log("--- Testing AI Screening Service ---");

const result = computeScore(candidateProfile, jobRequirements, resumeText);
console.log("Screening Result:", JSON.stringify(result, null, 2));

if (result.score > 50 && result.breakdown.skills > 20) {
    console.log("\nAI Screening Service Verification: SUCCESS");
} else {
    console.log("\nAI Screening Service Verification: FAILED");
    process.exit(1);
}
