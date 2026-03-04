import { extractSkills, calculateSimilarity, generateMatchInsights } from './backend/services/nlp.service.js';

// Mock data
const resumeText = "I have extensive experience with C++ and C# development. Proficient in React and Node.js. 5 years of experience as a software engineer.";
const jobData = {
    title: "Full Stack Developer",
    description: "Looking for a developer with skills in C++, React, and Node.js.",
    requirements: ["C++", "React", "Node.js", "C#"]
};

console.log("--- Testing NLP Service ---");

// 1. Test Skill Extraction
const skills = extractSkills(resumeText);
console.log("Extracted Skills:", skills.all);
const hasCpp = skills.all.includes("c++");
const hasCsharp = skills.all.includes("c#");
console.log("Has C++:", hasCpp);
console.log("Has C#:", hasCsharp);

// 2. Test Similarity
const similarity = calculateSimilarity(resumeText, jobData.description);
console.log("Similarity Score:", similarity);

// 3. Test Match Insights
const insights = generateMatchInsights(resumeText, jobData);
console.log("Match Insights Score:", insights.score);
console.log("Matching Skills:", insights.matchingSkills);
console.log("Missing Skills:", insights.missingSkills);

if (hasCpp && hasCsharp && insights.score > 70) {
    console.log("\nVERIFICATION SUCCESSFUL: Technical symbols preserved and score is high.");
} else {
    console.log("\nVERIFICATION FAILED: Skills not correctly matched or score too low.");
}
