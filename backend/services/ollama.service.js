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
