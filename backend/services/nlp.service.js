/**
 * NLP Semantic Matching Service — SmartHire Advisor Engine
 * 
 * Scoring Weights (STRICTLY ENFORCED):
 *   40% — Skills Match
 *   30% — Relevant Experience
 *   20% — Education & Certifications
 *   10% — Additional Factors (keyword relevance, soft skills, projects)
 */

import { analyzeWithOllama, generateHighlight } from './ollama.service.js';

// ─────────────────────────────────────────────
// 1. COMPREHENSIVE SKILL TAXONOMY & SYNONYMS
// ─────────────────────────────────────────────

const SKILL_SYNONYMS = {
    // JavaScript ecosystem
    "javascript": ["js", "es6", "es2015", "ecmascript", "vanilla js"],
    "typescript": ["ts"],
    "react": ["reactjs", "react.js", "react js"],
    "node.js": ["nodejs", "node", "node js"],
    "next.js": ["nextjs", "next js"],
    "express": ["expressjs", "express.js"],
    "vue": ["vuejs", "vue.js", "vue js"],
    "angular": ["angularjs", "angular.js", "angular js"],
    "redux": ["react redux", "redux toolkit", "rtk"],

    // Python ecosystem
    "python": ["py", "python3"],
    "django": ["django rest", "drf"],
    "flask": ["flask api"],
    "pandas": [],
    "numpy": [],
    "scikit-learn": ["sklearn", "scikit learn"],
    "pytorch": ["torch"],
    "tensorflow": ["tf", "keras"],

    // Databases
    "mongodb": ["mongo", "mongoose"],
    "sql": ["structured query language"],
    "postgresql": ["postgres", "pg"],
    "mysql": ["my sql"],
    "redis": [],
    "firebase": ["firestore"],

    // Cloud & DevOps
    "aws": ["amazon web services", "ec2", "s3", "lambda"],
    "azure": ["microsoft azure"],
    "gcp": ["google cloud", "google cloud platform"],
    "docker": ["containerization", "containers"],
    "kubernetes": ["k8s", "kube"],
    "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous deployment", "jenkins", "github actions"],
    "git": ["github", "gitlab", "bitbucket", "version control"],

    // Languages
    "java": [],
    "c++": ["cpp", "c plus plus"],
    "c#": ["csharp", "c sharp", "dotnet", ".net"],
    "ruby": ["ruby on rails", "rails", "ror"],
    "golang": ["go lang", "go programming"],
    "php": ["laravel", "symfony"],
    "swift": [],
    "kotlin": [],
    "rust": [],
    "scala": [],

    // AI/ML
    "machine learning": ["ml", "supervised learning", "unsupervised learning"],
    "deep learning": ["dl", "neural networks", "cnn", "rnn", "lstm"],
    "natural language processing": ["nlp", "text mining", "text analysis"],
    "computer vision": ["cv", "image recognition", "object detection"],
    "ai": ["artificial intelligence"],
    "data science": ["data analytics", "data analysis", "big data"],

    // Frontend
    "html": ["html5"],
    "css": ["css3", "stylesheet"],
    "sass": ["scss"],
    "tailwind": ["tailwindcss", "tailwind css"],
    "bootstrap": [],

    // API & Architecture
    "rest api": ["restful", "rest", "api development"],
    "graphql": ["gql"],
    "microservices": ["micro services", "service oriented"],

    // Testing
    "unit testing": ["tdd", "test driven"],
    "jest": [],
    "cypress": [],
    "selenium": [],
    "mocha": [],

    // Mobile
    "react native": ["rn"],
    "flutter": ["dart"],
    "android": ["android development"],
    "ios": ["ios development"],

    // Tools
    "figma": [],
    "jira": [],
    "agile": ["scrum", "kanban", "sprint"],
    "linux": ["ubuntu", "centos", "bash", "shell scripting"],
};

const SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "team player", "problem solving",
    "time management", "critical thinking", "adaptability", "creativity",
    "emotional intelligence", "negotiation", "conflict resolution", "mentoring",
    "collaboration", "analytical", "strategic thinking", "decision making",
    "project management", "stakeholder management", "interpersonal"
];

// Build a reverse lookup: alias → canonical skill
const ALIAS_TO_CANONICAL = {};
for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    ALIAS_TO_CANONICAL[canonical.toLowerCase()] = canonical.toLowerCase();
    for (const alias of aliases) {
        ALIAS_TO_CANONICAL[alias.toLowerCase()] = canonical.toLowerCase();
    }
}

// All known canonical skill names (for taxonomy lookup)
const ALL_TECHNICAL_SKILLS = Object.keys(SKILL_SYNONYMS).map(s => s.toLowerCase());

// ─────────────────────────────────────────────
// 2. TEXT PREPROCESSING
// ─────────────────────────────────────────────

export const preprocessText = (text) => {
    if (!text) return "";
    let processed = text.toLowerCase();

    // Remove URLs and emails
    processed = processed.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    processed = processed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');

    // Preserve technical symbols: +, #, . when adjacent to alphanumeric
    // But remove other noise symbols
    processed = processed.replace(/([^a-z0-9+#./\s@-])/g, ' ');
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
};

// ─────────────────────────────────────────────
// 3. SKILL EXTRACTION (with synonym resolution)
// ─────────────────────────────────────────────

/**
 * Normalize a single skill string to its canonical form.
 */
const normalizeSkill = (skill) => {
    const lower = skill.toLowerCase().trim();
    return ALIAS_TO_CANONICAL[lower] || lower;
};

/**
 * Extract skills from text using multi-strategy matching.
 * Returns canonical skill names.
 */
export const extractSkills = (text) => {
    const processed = preprocessText(text);
    const foundTechnical = new Set();
    const foundSoft = new Set();

    // Strategy 1: Check every known skill and all its aliases against the text
    for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
        const allForms = [canonical, ...aliases];
        for (const form of allForms) {
            const lowerForm = form.toLowerCase();
            // Use word boundary matching for short terms, substring for multi-word
            if (lowerForm.length <= 3) {
                // Short terms need word boundaries to avoid false positives
                const regex = new RegExp(`(?:^|\\s|[,;|/])${escapeRegex(lowerForm)}(?:$|\\s|[,;|/])`, 'i');
                if (regex.test(processed)) {
                    foundTechnical.add(canonical.toLowerCase());
                    break;
                }
            } else {
                if (processed.includes(lowerForm)) {
                    foundTechnical.add(canonical.toLowerCase());
                    break;
                }
            }
        }
    }

    // Strategy 2: Soft skills
    for (const skill of SOFT_SKILLS) {
        if (processed.includes(skill.toLowerCase())) {
            foundSoft.add(skill.toLowerCase());
        }
    }

    return {
        all: [...foundTechnical, ...foundSoft],
        technical: [...foundTechnical],
        soft: [...foundSoft]
    };
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─────────────────────────────────────────────
// 4. FUZZY SKILL MATCHING
// ─────────────────────────────────────────────

/**
 * Calculate Levenshtein distance between two strings.
 */
const levenshtein = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

/**
 * Match a required skill against a list of resume skills.
 * Returns a score between 0 and 1.
 *   1.0 = exact match (after normalization)
 *   0.8 = fuzzy match (Levenshtein distance ≤ 2)
 *   0.0 = no match
 */
const matchSkill = (requiredSkill, resumeSkills, resumeText) => {
    const normalizedReq = normalizeSkill(requiredSkill);

    // Check 1: Exact canonical match in extracted skills
    if (resumeSkills.includes(normalizedReq)) {
        return 1.0;
    }

    // Check 2: The required skill (or any alias) appears directly in resume text
    const processed = preprocessText(resumeText);
    const allForms = [requiredSkill.toLowerCase()];
    if (SKILL_SYNONYMS[normalizedReq]) {
        allForms.push(normalizedReq, ...SKILL_SYNONYMS[normalizedReq].map(s => s.toLowerCase()));
    }
    for (const form of allForms) {
        if (processed.includes(form)) {
            return 0.95;
        }
    }

    // Check 3: Fuzzy match — Levenshtein distance
    for (const resumeSkill of resumeSkills) {
        const dist = levenshtein(normalizedReq, resumeSkill);
        const maxLen = Math.max(normalizedReq.length, resumeSkill.length);
        if (maxLen > 0 && dist <= 2 && (dist / maxLen) < 0.4) {
            return 0.8;
        }
    }

    // Check 4: Partial substring match in resume text (e.g., "react" in "react native")
    for (const form of allForms) {
        if (form.length >= 4 && processed.includes(form)) {
            return 0.6;
        }
    }

    return 0.0;
};

// ─────────────────────────────────────────────
// 5. EXPERIENCE SCORING
// ─────────────────────────────────────────────

/**
 * Extract years of experience from text.
 */
const extractExperienceYears = (text) => {
    if (!text) return 0;
    const patterns = [
        /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
        /(\d+)\+?\s*years?\s*(?:exp)/i,
        /(?:total\s*)?experience[:\s]+(\d+)\+?\s*years?/i,
        /(\d+)\+?\s*years?\s*in\s*(?:the\s*)?industry/i,
        /(\d+)\s*yrs?\s*(?:exp|experience)/i,
        /experience\s*(?:of\s*)?(\d+)\s*years?/i,
        /(\d+)\+?\s*years?\s*(?:of\s*)?(?:professional|work|relevant)/i
    ];

    let maxExp = 0;
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            maxExp = Math.max(maxExp, parseInt(match[1]));
        }
    }

    // Also try date range calculation
    const dateRangeRegex = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\s*[-–]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})|present|current)/gi;
    let totalMonths = 0;
    const matches = text.matchAll(dateRangeRegex);
    for (const match of matches) {
        const startYear = parseInt(match[1]);
        const endYear = match[2] ? parseInt(match[2]) : new Date().getFullYear();
        if (startYear > 1990 && endYear >= startYear) {
            totalMonths += (endYear - startYear) * 12;
        }
    }
    if (totalMonths > 0) {
        maxExp = Math.max(maxExp, Math.round(totalMonths / 12));
    }

    return maxExp;
};

/**
 * Score experience match (0–100, will be weighted to 30%).
 */
const scoreExperience = (candidateExp, requiredExp) => {
    if (requiredExp === 0 || requiredExp === undefined) {
        // No experience requirement — give high score but not full
        return candidateExp > 0 ? 90 : 70;
    }

    const ratio = candidateExp / requiredExp;
    if (ratio >= 1.0) return 100;      // Meets or exceeds
    if (ratio >= 0.75) return 85;      // Close match
    if (ratio >= 0.5) return 65;       // Partial match
    if (ratio >= 0.25) return 40;      // Some experience
    if (candidateExp > 0) return 25;   // Minimal experience
    return 10;                          // No experience (not 0 — avoid zeroing)
};

// ─────────────────────────────────────────────
// 6. EDUCATION & CERTIFICATION SCORING
// ─────────────────────────────────────────────

const DEGREE_LEVELS = {
    "phd": 100, "doctorate": 100,
    "master": 90, "masters": 90, "mtech": 90, "m.tech": 90, "mba": 90, "msc": 90, "m.sc": 90, "mca": 90,
    "bachelor": 75, "bachelors": 75, "btech": 75, "b.tech": 75, "be": 70, "b.e": 70,
    "bsc": 70, "b.sc": 70, "bca": 70, "degree": 65, "graduate": 60, "undergraduate": 55,
    "diploma": 45, "associate": 40, "certification": 35, "certificate": 35
};

/**
 * Score education and certifications (0–100, will be weighted to 20%).
 */
const scoreEducation = (resumeText, certifications, jdText) => {
    const lowerResume = (resumeText || "").toLowerCase().replace(/\./g, '');
    const lowerJd = (jdText || "").toLowerCase();

    // Education scoring (60% of education component)
    let educationScore = 20; // Base score for any resume
    for (const [keyword, score] of Object.entries(DEGREE_LEVELS)) {
        if (lowerResume.includes(keyword)) {
            educationScore = Math.max(educationScore, score);
        }
    }

    // Certification scoring (40% of education component)
    let certScore = 0;
    if (certifications && certifications.length > 0) {
        // Having certifications is good
        certScore = Math.min(100, 30 + certifications.length * 15);

        // Bonus if certifications match JD keywords
        const matchingCerts = certifications.filter(cert =>
            lowerJd.includes(cert.toLowerCase())
        );
        if (matchingCerts.length > 0) {
            certScore = Math.min(100, certScore + matchingCerts.length * 20);
        }
    }

    // Combined: 60% education, 40% certifications
    return Math.round(educationScore * 0.6 + certScore * 0.4);
};

// ─────────────────────────────────────────────
// 7. ADDITIONAL FACTORS SCORING
// ─────────────────────────────────────────────

/**
 * Score additional factors (0–100, will be weighted to 10%).
 * Includes: keyword relevance, soft skills, and text similarity.
 */
const scoreAdditionalFactors = (resumeText, jdText, softSkillsFound) => {
    const resumeWords = preprocessText(resumeText).split(' ').filter(w => w.length > 3);
    const jdWords = preprocessText(jdText).split(' ').filter(w => w.length > 3);

    if (resumeWords.length === 0 || jdWords.length === 0) return 20;

    // Keyword relevance: % of JD keywords found in resume
    const jdSet = new Set(jdWords);
    const resumeSet = new Set(resumeWords);
    const commonKeywords = [...jdSet].filter(w => resumeSet.has(w));
    const keywordRelevance = (commonKeywords.length / jdSet.size) * 100;

    // Soft skills bonus
    const softSkillScore = Math.min(100, softSkillsFound.length * 20);

    // Combined: 70% keyword relevance, 30% soft skills
    return Math.round(keywordRelevance * 0.7 + softSkillScore * 0.3);
};

// ─────────────────────────────────────────────
// 8. ROLE PREDICTION
// ─────────────────────────────────────────────

export const predictRole = (skills) => {
    const roles = {
        "Frontend Developer": ["react", "javascript", "html", "css", "tailwind", "next.js", "bootstrap", "typescript", "vue", "angular"],
        "Backend Developer": ["node.js", "express", "python", "django", "flask", "java", "sql", "postgresql", "mongodb", "redis"],
        "Full Stack Developer": ["react", "node.js", "javascript", "express", "mongodb", "sql", "next.js", "typescript"],
        "Data Scientist": ["python", "pandas", "numpy", "scikit-learn", "pytorch", "tensorflow", "machine learning", "ai", "data science"],
        "DevOps Engineer": ["docker", "kubernetes", "aws", "azure", "ci/cd", "git", "linux"],
        "Mobile Developer": ["react native", "flutter", "swift", "kotlin", "android", "ios"]
    };

    let bestRole = "Software Engineer";
    let maxMatch = 0;

    for (const [role, roleSkills] of Object.entries(roles)) {
        const matchCount = roleSkills.filter(skill => skills.includes(skill)).length;
        if (matchCount > maxMatch) {
            maxMatch = matchCount;
            bestRole = role;
        }
    }

    return bestRole;
};

// ─────────────────────────────────────────────
// 9. MAIN: generateMatchInsights (40:30:20:10)
// ─────────────────────────────────────────────

export const generateMatchInsights = async (resumeText, jobData, parsedData = {}, user = {}) => {
    // ── TRY OLLAMA FIRST (Semantic LLM Analysis) ──
    const ollamaResult = await analyzeWithOllama(resumeText, jobData);

    if (ollamaResult) {
        // Return Ollama results but ensure display fields (experience, education) are populated
        // if the LLM didn't return them in the expected format OR if we want to trust our extraction more.

        // Use our existing extraction for text fields if they are missing or "Not Specified"
        const candidateExp = (user?.profile?.experience > 0)
            ? user.profile.experience
            : (parsedData.experience > 0 ? parsedData.experience : extractExperienceYears(resumeText));

        const finalExperience = (user?.profile?.experience > 0)
            ? `${user.profile.experience}+ Years`
            : (candidateExp > 0 ? `${candidateExp}+ Years` : "Fresher (0 Years)");

        const finalEducation = (user?.profile?.education && user.profile.education !== "Not Specified")
            ? user.profile.education
            : (parsedData.education || "Not Specified");

        const profileCerts = user?.profile?.certifications || [];
        const parsedCerts = parsedData.certifications || [];
        const finalCertifications = [...new Set([...profileCerts, ...parsedCerts])];

        return {
            ...ollamaResult,
            experience: finalExperience,
            education: finalEducation,
            certifications: finalCertifications
        };
    }

    // ── FALLBACK TO RULE-BASED ENGINE ──
    console.log("[MatchInsights] Falling back to rule-based engine.");
    const jdText = `${jobData.title || ''} ${jobData.description || ''} ${(jobData.requirements || []).join(' ')}`;
    const requiredSkillsRaw = jobData.requirements || [];

    // ── EXTRACT ──
    const resumeSkillsData = extractSkills(resumeText);
    const jdSkillsData = extractSkills(jdText);
    const resumeSkills = resumeSkillsData.all;
    const jdSkills = jdSkillsData.all;

    // ── SKILLS MATCH (40%) ──
    let skillScoreRaw = 0;
    const matchingSkills = [];
    const missingSkills = [];
    const partialMatches = [];

    // Match each JD requirement (both extracted skills and raw requirements)
    const allRequirements = [...new Set([...jdSkills, ...requiredSkillsRaw.map(r => normalizeSkill(r))])];

    if (allRequirements.length > 0) {
        let totalMatchScore = 0;

        for (const req of allRequirements) {
            const score = matchSkill(req, resumeSkills, resumeText);
            if (score >= 0.8) {
                matchingSkills.push(req);
                totalMatchScore += score;
            } else if (score >= 0.5) {
                partialMatches.push(req);
                totalMatchScore += score;
            } else {
                missingSkills.push(req);
                totalMatchScore += score;
            }
        }

        skillScoreRaw = (totalMatchScore / allRequirements.length) * 100;
    } else {
        // No requirements specified — give partial credit
        skillScoreRaw = resumeSkills.length > 0 ? 50 : 20;
    }

    // ── EXPERIENCE (30%) ──
    const candidateExp = (user?.profile?.experience > 0)
        ? user.profile.experience
        : (parsedData.experience > 0 ? parsedData.experience : extractExperienceYears(resumeText));
    const requiredExp = jobData.experienceLevel || 0;
    const experienceScoreRaw = scoreExperience(candidateExp, requiredExp);

    // ── EDUCATION & CERTIFICATIONS (20%) ──
    const profileCerts = user?.profile?.certifications || [];
    const parsedCerts = parsedData.certifications || [];
    const finalCertifications = [...new Set([...profileCerts, ...parsedCerts])];
    const educationScoreRaw = scoreEducation(resumeText, finalCertifications, jdText);

    // ── ADDITIONAL FACTORS (10%) ──
    const additionalScoreRaw = scoreAdditionalFactors(resumeText, jdText, resumeSkillsData.soft);

    // ── FINAL WEIGHTED SCORE ──
    const weightedScore = Math.round(
        (skillScoreRaw * 0.40) +
        (experienceScoreRaw * 0.30) +
        (educationScoreRaw * 0.20) +
        (additionalScoreRaw * 0.10)
    );
    const finalScore = Math.max(5, Math.min(100, weightedScore)); // Never show 0%, floor at 5%

    // ── SCORE BREAKDOWN ──
    const scoreBreakdown = {
        skills: Math.round(skillScoreRaw * 0.40),
        experience: Math.round(experienceScoreRaw * 0.30),
        education: Math.round(educationScoreRaw * 0.20),
        additional: Math.round(additionalScoreRaw * 0.10)
    };

    // ── ROLE PREDICTION ──
    const predictedRole = predictRole(resumeSkills);

    // ── EXPERIENCE & EDUCATION DISPLAY TEXT ──
    const finalExperience = (user?.profile?.experience > 0)
        ? `${user.profile.experience}+ Years`
        : (candidateExp > 0 ? `${candidateExp}+ Years` : "Fresher (0 Years)");

    const finalEducation = (user?.profile?.education && user.profile.education !== "Not Specified")
        ? user.profile.education
        : (parsedData.education || "Not Specified");

    // ── STRENGTH AREAS ──
    const matchingTechnical = matchingSkills.filter(s => ALL_TECHNICAL_SKILLS.includes(s));
    const matchingSoft = matchingSkills.filter(s => SOFT_SKILLS.map(ss => ss.toLowerCase()).includes(s));

    const strengthAreas = [];
    if (matchingTechnical.length > 0) {
        strengthAreas.push(`Strong technical foundation in ${matchingTechnical.slice(0, 4).join(', ')}.`);
    }
    if (matchingSoft.length > 0) {
        strengthAreas.push(`Demonstrated ${matchingSoft.slice(0, 2).join(' and ')} capabilities.`);
    }
    if (candidateExp >= requiredExp && requiredExp > 0) {
        strengthAreas.push(`Experience level meets or exceeds requirements (${candidateExp}+ years).`);
    }
    if (finalCertifications.length > 0) {
        const certDisplay = finalCertifications.slice(0, 2).join(', ');
        strengthAreas.push(`Relevant credentials: ${certDisplay}.`);
    }
    if (finalScore >= 70) {
        strengthAreas.push("Overall profile is well-aligned with role requirements.");
    } else if (finalScore >= 40) {
        strengthAreas.push("Profile shows partial alignment; targeted upskilling can close the gap.");
    }
    if (strengthAreas.length === 0) {
        strengthAreas.push("Upload a more detailed resume to unlock strength analysis.");
    }

    // ── GAP INSIGHTS ──
    let gapInsights = "";
    if (missingSkills.length === 0) {
        gapInsights = "Your profile strongly aligns with the technical requirements. No significant skill gaps detected.";
    } else if (missingSkills.length <= 2) {
        gapInsights = `Minor gaps detected. Focus on acquiring ${missingSkills.join(' and ')} to strengthen your candidacy.`;
    } else {
        gapInsights = `Key gaps identified in ${missingSkills.slice(0, 3).join(', ')}. Consider targeted learning or project experience in these areas.`;
    }

    // ── IMPROVEMENT TIPS ──
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
    if (candidateExp < requiredExp) {
        tips.push(`The role expects ${requiredExp}+ years of experience. Consider gaining more through internships or open-source contributions.`);
    }
    if (scoreBreakdown.education < 10) {
        tips.push("Add relevant certifications to boost your education score (AWS, PMP, Google Cloud, etc.).");
    }

    return {
        score: finalScore,
        scoreBreakdown,
        matchingSkills,
        missingSkills,
        partialMatches,
        strengthAreas,
        gapInsights,
        improvementTips: tips,
        predictedRole,
        experience: finalExperience,
        education: finalEducation,
        certifications: finalCertifications
    };
};

export const generateSpotlightHighlight = async (resumeText, jobData) => {
    try {
        const highlight = await generateHighlight(resumeText, jobData);
        return highlight || "Highly relevant profile with matching core competencies.";
    } catch (error) {
        return "Experienced professional with relevant skills.";
    }
};

// ─────────────────────────────────────────────
// 10. LEGACY EXPORTS (backward compatibility)
// ─────────────────────────────────────────────

export const calculateSimilarity = (text1, text2) => {
    const words1 = preprocessText(text1).split(' ').filter(w => w.length > 2);
    const words2 = preprocessText(text2).split(' ').filter(w => w.length > 2);

    if (words1.length === 0 || words2.length === 0) return 0;

    const set1 = new Set(words1);
    const set2 = new Set(words2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const overlap = intersection.size / Math.min(set1.size, set2.size);

    const uniqueWords = [...new Set([...words1, ...words2])];
    const vector1 = uniqueWords.map(word => words1.filter(w => w === word).length);
    const vector2 = uniqueWords.map(word => words2.filter(w => w === word).length);

    const dotProduct = vector1.reduce((acc, current, i) => acc + current * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((acc, current) => acc + current * current, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((acc, current) => acc + current * current, 0));

    const cosine = (magnitude1 && magnitude2) ? dotProduct / (magnitude1 * magnitude2) : 0;

    return (cosine * 0.5) + (overlap * 0.5);
};
