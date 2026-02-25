import pdf from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";

const skillsTaxonomy = [
    "JavaScript", "React", "Node.js", "Express", "MongoDB", "Python", "Java", "C++",
    "AWS", "Docker", "Kubernetes", "SQL", "TypeScript", "HTML", "CSS", "Agile",
    "Tailwind", "Git", "DevOps", "Machine Learning", "Data Analysis", "Figma", "UI/UX"
];

export const parseResume = async (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    let text = "";

    try {
        if (extension === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else if (extension === 'docx') {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        }

        // Logic to extract skills, email, phone, experience, education
        const parsedData = {
            skills: [],
            email: "",
            phone: "",
            experience: 0,
            education: ""
        };

        // Skills extraction
        skillsTaxonomy.forEach(skill => {
            if (text.toLowerCase().includes(skill.toLowerCase())) {
                parsedData.skills.push(skill);
            }
        });

        // Email extraction
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) parsedData.email = emailMatch[0];

        // Phone extraction
        const phoneMatch = text.match(/(\+?\d{1,3}[- ]?)?\d{10}/);
        if (phoneMatch) parsedData.phone = phoneMatch[0];

        // Experience extraction (very simple regex)
        const expMatch = text.match(/(\d+)\+?\s*years?\s*of\s*experience/i);
        if (expMatch) parsedData.experience = parseInt(expMatch[1]);

        // Education extraction
        if (text.toLowerCase().includes("phd")) parsedData.education = "PhD";
        else if (text.toLowerCase().includes("master")) parsedData.education = "Masters";
        else if (text.toLowerCase().includes("bachelor")) parsedData.education = "Bachelors";

        return parsedData;

    } catch (error) {
        console.error("Error parsing resume:", error);
        return null;
    }
};
