import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Advanced AI Recruitment Analysis using Ollama (Local LLM)
 */
export const analyzeWithOllama = async (resumeText, jobData) => {
    try {
        const jdText = `Job Title: ${jobData.title}
Job Description: ${jobData.description}
Requirements: ${(jobData.requirements || []).join(', ')}
Required Experience: ${jobData.experienceLevel || 0} years`;

        const systemPrompt = `You are an advanced AI Recruitment Analysis Engine running inside Ollama.

You specialize in semantic resume-to-job evaluation across ALL domains (Software, Marketing, Mechanical, Finance, Research, Healthcare, Startup roles, etc.)

You must evaluate candidates using a STRICT weighted scoring model:
- 40% Skills Match
- 30% Relevant Experience
- 20% Education & Certifications
- 10% Additional Factors (projects, tools, domain exposure, achievements, soft skills)

CRITICAL RULES:
1. Use semantic understanding (not just keyword matching).
2. Recognize synonyms (e.g., ML = Machine Learning).
3. Give partial credit where appropriate.
4. Never return 0% unless resume is completely unrelated.
5. Normalize all category scores between 0–100.
6. Apply weighted formula internally:
   final_score = (skills * 0.40) + (experience * 0.30) + (education * 0.20) + (additional * 0.10)
7. Round final_score to nearest integer.
8. Do NOT hallucinate skills not present.
9. Be logically consistent and professional.
10. Return STRICT JSON only. No explanation outside JSON.

Expected JSON format:
{
  "score": number,
  "scoreBreakdown": {
    "skills": number (weighted, max 40),
    "experience": number (weighted, max 30),
    "education": number (weighted, max 20),
    "additional": number (weighted, max 10)
  },
  "matchingSkills": [string],
  "missingSkills": [string],
  "predictedRole": string,
  "strengthAreas": [string],
  "gapInsights": string,
  "improvementTips": [string]
}`;

        const userPrompt = `Job Requirements:
${jdText}

Candidate Resume:
${resumeText}`;

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: `System: ${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
            stream: false,
            format: "json"
        }, {
            timeout: 30000 // 30 second timeout for local LLM
        });

        if (response.data && response.data.response) {
            const result = JSON.parse(response.data.response);
            console.log(`[Ollama] Analysis complete. Score: ${result.score}%`);
            return result;
        }

        throw new Error("Invalid response from Ollama");
    } catch (error) {
        console.error(`[Ollama] Error: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            console.warn("[Ollama] Service not running. Falling back to rule-based engine.");
        }
        return null; // Signals fallback
    }
};

/**
 * Generates tailored resume improvement suggestions based on a specific Job Description.
 */
export const getResumeOptimization = async (resumeText, jobData) => {
    try {
        const jdText = `Job Title: ${jobData.title}
Job Description: ${jobData.description}
Requirements: ${(jobData.requirements || []).join(', ')}`;

        const systemPrompt = `You are an expert Resume Strategist and Technical Recruiter.
Analyze the provided Job Description (JD) and the Candidate Resume.
Provide high-impact, actionable suggestions to help the candidate optimize their resume for this specific role.

STRICT REQUIREMENTS:
1. Identify 5-8 missing or underemphasized keywords (Technical & Soft Skills).
2. Suggest 3-5 high-impact bullet points to add to their "Work Experience" or "Projects" sections. 
3. These bullet points MUST be tailored to the JD but feasible based on their existing profile.
4. For each suggestion, explain WHY it helps (e.g., "Matches a key requirement in the JD regarding scalable APIs").
5. Keep the tone professional, encouraging, and sharp.
6. Return STRICT JSON only.

Expected JSON format:
{
  "missingKeywords": [
    { "keyword": string, "importance": "high" | "medium", "context": string }
  ],
  "suggestedBulletPoints": [
    { "text": string, "reason": string }
  ],
  "contentStrategy": string,
  "overallAdvice": string
}`;

        const userPrompt = `JD:
${jdText}

Resume:
${resumeText}`;

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: `System: ${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
            stream: false,
            format: "json"
        }, {
            timeout: 45000 // Slightly longer for detailed suggestions
        });

        if (response.data && response.data.response) {
            return JSON.parse(response.data.response);
        }
        return null;
    } catch (error) {
        console.error(`[Ollama Optimization] Error: ${error.message}`);
        return null;
    }
};
/**
 * Generates a sharp, 1-sentence analytical highlight for a candidate.
 */
export const generateHighlight = async (resumeText, jobData) => {
    try {
        const jdText = `Job Title: ${jobData.title}, Requirements: ${(jobData.requirements || []).join(', ')}`;

        const systemPrompt = `You are a Senior Technical Recruiter.
Analyze the candidate's resume against the Job Description.
Write a ONE-SENTENCE "Spotlight" summary (max 20 words) that highlights their strongest fit or most critical gap.
Be sharp, professional, and analytical. Use active verbs.
Return STRICT JSON only.

Expected JSON format:
{
  "highlight": string
}`;

        const userPrompt = `JD: ${jdText}\nResume: ${resumeText.slice(0, 2000)}`;

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: `System: ${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
            stream: false,
            format: "json"
        }, {
            timeout: 20000
        });

        if (response.data && response.data.response) {
            const result = JSON.parse(response.data.response);
            return result.highlight;
        }
        return null;
    } catch (error) {
        console.error(`[Ollama Highlight] Error: ${error.message}`);
        return null;
    }
};

/**
 * Generates an Interview Prep Kit using Ollama.
 */
export const generatePrepKit = async (resumeText, jobData) => {
    try {
        const jdText = `Job Title: ${jobData.title}
Job Description: ${jobData.description}
Requirements: ${(jobData.requirements || []).join(', ')}`;

        const systemPrompt = `You are a Technical Interview Coach.
Generate a tailored Interview Preparation Kit based on the provided Job Description and the candidate's Resume.

STRICT REQUIREMENTS:
1. Provide 5 technical questions specific to the core technologies in the JD.
2. Provide 3 behavioral questions related to the role's seniority/soft skills.
3. For each technical question, provide a brief "Hint" or expected answer direction.
4. Keep it highly relevant and professional.
5. Return STRICT JSON only.

Expected JSON format:
{
  "technicalQuestions": [
    { "question": string, "hint": string }
  ],
  "behavioralQuestions": [
    { "question": string, "rationale": string }
  ],
  "prepAdvice": string
}`;

        const userPrompt = `JD:\n${jdText}\n\nResume:\n${resumeText}`;

        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: OLLAMA_MODEL,
            prompt: `System: ${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
            stream: false,
            format: "json"
        }, {
            timeout: 45000
        });

        if (response.data && response.data.response) {
            return JSON.parse(response.data.response);
        }
        return null;
    } catch (error) {
        console.error(`[Ollama PrepKit] Error: ${error.message}`);
        return null;
    }
};
