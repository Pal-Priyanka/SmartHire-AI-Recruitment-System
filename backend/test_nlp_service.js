import { extractSkills, calculateSimilarity, predictRole, generateMatchInsights } from './services/nlp.service.js';

const resumeText = `
John Doe
Software Engineer with 5 years of experience in full stack development.
Skills: JavaScript, React, Node.js, Express, MongoDB, Python, AWS, Docker.
Education: Bachelor of Technology in Computer Science.
Experience:
- Senior Developer at TechCorp (3 years): Led a team of 5, implemented microservices using Node.js and Docker.
- Junior Developer at WebSoft (2 years): Developed frontend components using React and Redux.
`;

const jobData = {
    title: "Full Stack Developer",
    description: "We are looking for a Full Stack Developer proficient in React and Node.js with experience in AWS.",
    requirements: ["React", "Node.js", "JavaScript", "AWS", "Docker", "SQL"]
};

console.log("--- Testing NLP Service ---");

const skills = extractSkills(resumeText);
console.log("Extracted Skills:", skills.all);

const similarity = calculateSimilarity(resumeText, jobData.description);
console.log("Similarity Score:", similarity.toFixed(4));

const role = predictRole(skills.all);
console.log("Predicted Role:", role);

const insights = generateMatchInsights(resumeText, jobData, { experience: 5, education: "B.Tech" });
console.log("Match Insights:", JSON.stringify(insights, null, 2));

if (skills.all.length > 0 && similarity > 0 && role && insights.score > 0) {
    console.log("\nNLP Service Verification: SUCCESS");
} else {
    console.log("\nNLP Service Verification: FAILED");
    process.exit(1);
}
