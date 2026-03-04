import { computeScore } from './services/aiScreening.js';

const mockJD = {
    description: "Looking for a Senior React Developer with Node.js and MongoDB experience.",
    requirements: ["React", "Node.js", "MongoDB", "JavaScript"],
    experienceLevel: 5
};

const mockResumeIdentical = "Senior React Developer with Node.js and MongoDB experience. Proficient in JavaScript. 5 years of experience. Bachelor's degree in Computer Science.";

const mockCandidateProfile = {
    skills: ["React", "Node.js", "MongoDB", "JavaScript"],
    yearsOfExperience: 5
};

console.log("--- Testing Improved AI Matching ---");

const resultIdentical = computeScore(mockCandidateProfile, mockJD, mockResumeIdentical);
console.log("Identical Match Score:", resultIdentical.score + "%");
console.log("Breakdown:", JSON.stringify(resultIdentical.breakdown, null, 2));

const mockResumePartial = "Junior Developer with React skills. 2 years of experience.";
const mockProfilePartial = { skills: ["React"], yearsOfExperience: 2 };

const resultPartial = computeScore(mockProfilePartial, mockJD, mockResumePartial);
console.log("\nPartial Match Score:", resultPartial.score + "%");

if (resultIdentical.score > 90) {
    console.log("\nSUCCESS: AI Matching correctly identifies high-relevance candidates.");
} else {
    console.log("\nFAILURE: AI Matching score still too low for identical content.");
}
