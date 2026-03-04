import { computeScore } from './backend/services/aiScreening.js';

const sampleProfile = {
    skills: ['React', 'Node.js', 'MongoDB'],
    yearsOfExperience: 3,
    phoneNumber: '1234567890',
    bio: 'Software Engineer'
};

const jobRequirements = {
    requirements: ['React', 'Express', 'Node.js', 'PostgreSQL'],
    experienceLevel: 2,
    description: 'We are looking for a Full Stack Developer with experience in React and Node.js. Knowledge of PostgreSQL is a plus.'
};

const resumeText = `
Experienced Software Engineer with a focus on React and Node.js.
Worked with MongoDB and PostgreSQL in various projects.
3 years of experience in full stack development.
B.Tech in Computer Science.
`;

const result = computeScore(sampleProfile, jobRequirements, resumeText);
console.log("--- Scoring Result ---");
console.log(JSON.stringify(result, null, 2));

const result2 = computeScore(sampleProfile, jobRequirements, resumeText);
console.log("\n--- Second Call (Deterministic Check) ---");
console.log("Scores match:", JSON.stringify(result) === JSON.stringify(result2));
