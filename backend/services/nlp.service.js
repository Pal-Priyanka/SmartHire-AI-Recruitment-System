/**
 * NLP Semantic Matching Service
 * Provides deep text analysis, skill extraction, and similarity scoring.
 */

// Comprehensive skill taxonomy
const SKILL_TAXONOMY = {
    technical: [
        "javascript", "react", "node.js", "python", "java", "cpp", "c++", "c#", "ruby", "golang", "php", "typescript",
        "html", "css", "sass", "tailwind", "bootstrap", "mongodb", "sql", "postgresql", "mysql", "redis", "docker",
        "kubernetes", "aws", "azure", "gcp", "firebase", "git", "rest api", "graphql", "redux", "express", "next.js",
        "django", "flask", "pytorch", "tensorflow", "scikit-learn", "pandas", "numpy", "machine learning", "ai",
        "data science", "devops", "ci/cd", "microservices", "unit testing", "jest", "cypress"
    ],
    soft: [
        "leadership", "communication", "teamwork", "problem solving", "time management", "critical thinking",
        "adaptability", "creativity", "emotional intelligence", "negotiation", "conflict resolution", "mentoring"
    ],
    normalization: {
        "js": "javascript",
        "ts": "typescript",
        "reactjs": "react",
        "nodejs": "node.js",
        "ml": "machine learning",
        "dl": "deep learning",
        "nlp": "natural language processing",
        "k8s": "kubernetes",
        "postgres": "postgresql"
    }
};

/**
 * Preprocess text: lowercasing, noise removal, and basic normalization
 */
export const preprocessText = (text) => {
    if (!text) return "";
    let processed = text.toLowerCase();

    // Remove URLs, emails, and symbols but preserve + and # for C++, C#, etc.
    processed = processed.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    processed = processed.replace(/([^a-z0-9+#\s])/g, ' '); // More selective removal
    processed = processed.replace(/\s+/g, ' ').trim();

    // Basic normalization based on taxonomy
    Object.keys(SKILL_TAXONOMY.normalization).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'g');
        processed = processed.replace(regex, SKILL_TAXONOMY.normalization[term]);
    });

    return processed;
};

/**
 * Extract structured skills from text
 */
export const extractSkills = (text) => {
    const processed = preprocessText(text);
    const foundTechnical = SKILL_TAXONOMY.technical.filter(skill =>
        processed.includes(skill.toLowerCase())
    );
    const foundSoft = SKILL_TAXONOMY.soft.filter(skill =>
        processed.includes(skill.toLowerCase())
    );

    return {
        all: [...new Set([...foundTechnical, ...foundSoft])],
        technical: foundTechnical,
        soft: foundSoft
    };
};

export const calculateSimilarity = (text1, text2) => {
    const words1 = preprocessText(text1).split(' ').filter(w => w.length > 2);
    const words2 = preprocessText(text2).split(' ').filter(w => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // 1. Overlap Coefficient (Keyword Match)
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const overlap = intersection.size / Math.min(set1.size, set2.size);

    // 2. Cosine Similarity (Semantic)
    const uniqueWords = [...new Set([...words1, ...words2])];
    const vector1 = uniqueWords.map(word => words1.filter(w => w === word).length);
    const vector2 = uniqueWords.map(word => words2.filter(w => w === word).length);

    const dotProduct = vector1.reduce((acc, current, i) => acc + current * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, current) => acc + current * current, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, current) => acc + current * current, 0));

    const cosine = (magnitude1 && magnitude2) ? dotProduct / (magnitude1 * magnitude2) : 0;

    // Hybrid Score: 50% Cosine, 50% Overlap
    return (cosine * 0.5) + (overlap * 0.5);
};

/**
 * Generate full Match Insights
 */
/**
 * Predict the professional role based on extracted skills
 */
export const predictRole = (skills) => {
    const roles = {
        "Frontend Developer": ["react", "javascript", "html", "css", "tailwind", "next.js", "bootstrap", "typescript"],
        "Backend Developer": ["node.js", "express", "python", "django", "flask", "java", "spring", "sql", "postgresql", "mongodb"],
        "Full Stack Developer": ["react", "node.js", "javascript", "express", "mongodb", "sql", "next.js"],
        "Data Scientist": ["python", "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "machine learning", "ai"],
        "DevOps Engineer": ["docker", "kubernetes", "aws", "azure", "ci/cd", "git", "jenkins", "terraform"],
        "Mobile Developer": ["react native", "flutter", "swift", "kotlin", "android", "ios"]
    };

    let bestRole = "Software Engineer";
    let maxMatch = 0;

    Object.keys(roles).forEach(role => {
        const matchCount = roles[role].filter(skill => skills.includes(skill)).length;
        if (matchCount > maxMatch) {
            maxMatch = matchCount;
            bestRole = role;
        }
    });

    return bestRole;
};

export const generateMatchInsights = (resumeText, jobData, parsedData = {}, user = {}) => {
    const jdText = `${jobData.title} ${jobData.description} ${jobData.requirements.join(' ')}`;

    const resumeSkillsData = extractSkills(resumeText);
    const jdSkillsData = extractSkills(jdText);
    const resumeSkills = resumeSkillsData.all;
    const jdSkills = jdSkillsData.all;

    const matchingSkills = jdSkills.filter(skill => resumeSkills.includes(skill));
    const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));

    const similarity = calculateSimilarity(resumeText, jdText);

    // Skill-weighted score
    const skillScore = jdSkills.length > 0 ? (matchingSkills.length / jdSkills.length) * 100 : 50;
    const baseScore = similarity * 100;

    // Combined Score with high sensitivity weighting (50% similarity, 50% skill match)
    const finalScore = Math.min(100, Math.round((baseScore * 0.5) + (skillScore * 0.5)));

    // Add bonus for extremely high similarity (near identical text)
    const bonus = similarity > 0.85 ? (1 - similarity) * 15 : 0;
    const adjustedScore = Math.min(100, Math.round(finalScore + bonus));

    // Role Prediction
    const predictedRole = predictRole(resumeSkills);

    // Fallback logic for Experience and Education
    // PRIORITIZE Profile (Manual/Cached) > Parsed (Live Cloudinary)
    const finalExperience = (user?.profile?.experience > 0)
        ? `${user.profile.experience}+ Years`
        : (parsedData.experience > 0 ? `${parsedData.experience}+ Years` : "Not Specified");

    const finalEducation = (user?.profile?.education && user.profile.education !== "Not Specified")
        ? user.profile.education
        : (parsedData.education || "Not Specified");

    // Merge certifications from both sources
    const profileCerts = user?.profile?.certifications || [];
    const parsedCerts = parsedData.certifications || [];
    const finalCertifications = [...new Set([...profileCerts, ...parsedCerts])];

    // Strength Areas — categorized
    const matchingTechnical = matchingSkills.filter(s => SKILL_TAXONOMY.technical.includes(s));
    const matchingSoft = matchingSkills.filter(s => SKILL_TAXONOMY.soft.includes(s));

    // Certification matching (if any)
    const matchingCerts = finalCertifications.filter(cert =>
        jdText.toLowerCase().includes(cert.toLowerCase())
    );

    const strengthAreas = [];
    if (matchingCerts.length > 0) {
        strengthAreas.push(`Verified credentials matched: ${matchingCerts.slice(0, 2).join(', ')}.`);
    }
    if (matchingTechnical.length > 0) {
        strengthAreas.push(`Strong technical foundation in ${matchingTechnical.slice(0, 3).join(', ')}.`);
    }
    if (matchingSoft.length > 0) {
        strengthAreas.push(`Demonstrated ${matchingSoft.slice(0, 2).join(' and ')} capabilities.`);
    }
    if (finalScore >= 70) {
        strengthAreas.push("Overall profile is well-aligned with role requirements.");
    } else if (finalScore >= 40) {
        strengthAreas.push("Profile shows partial alignment; targeted upskilling can close the gap.");
    }
    if (strengthAreas.length === 0) {
        strengthAreas.push("Upload a more detailed resume to unlock strength analysis.");
    }

    // Gap Insights
    let gapInsights = "";
    if (missingSkills.length === 0) {
        gapInsights = "Your profile strongly aligns with the technical requirements. No significant skill gaps detected.";
    } else if (missingSkills.length <= 2) {
        gapInsights = `Minor gaps detected. Focus on acquiring ${missingSkills.join(' and ')} to strengthen your candidacy.`;
    } else {
        gapInsights = `Key gaps identified in ${missingSkills.slice(0, 3).join(', ')}. Consider targeted learning or project experience in these areas.`;
    }

    // Improvement Tips
    const tips = [];
    if (matchingSkills.length > 0) {
        tips.push(`Highlight your experience with ${matchingSkills[0]} more prominently in your resume.`);
    }
    tips.push("Quantify your achievements in previous roles with metrics and impact numbers.");
    if (missingSkills.length > 0) {
        tips.push(`Build projects or take courses demonstrating ${missingSkills[0]} proficiency.`);
    }
    if (missingSkills.length > 1) {
        tips.push(`Add ${missingSkills[1]} to your skill set through hands-on practice or certifications.`);
    }
    tips.push("Tailor your resume keywords to closely mirror the job description language.");
    if (finalScore < 50) {
        tips.push("Consider gaining more practical experience through internships or open-source contributions.");
    }

    return {
        score: adjustedScore,
        matchingSkills,
        missingSkills,
        strengthAreas,
        gapInsights,
        improvementTips: tips,
        predictedRole,
        experience: finalExperience,
        education: finalEducation,
        certifications: finalCertifications
    };
};
