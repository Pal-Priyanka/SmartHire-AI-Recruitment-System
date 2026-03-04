import natural from 'natural';
import nlp from 'compromise';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

/**
 * Preprocesses text by tokenizing, lowercasing, and removing short words.
 * @param {string} text 
 * @returns {string[]} tokens
 */
const preprocess = (text) => {
    if (!text) return [];
    return tokenizer.tokenize(text.toLowerCase())
        .filter(word => word.length > 2);
};

/**
 * Calculates TF-IDF Cosine Similarity between two text blocks.
 * @param {string} text1 
 * @param {string} text2 
 * @returns {number} 0 to 1
 */
const calculateSimilarity = (text1, text2) => {
    const tokens1 = preprocess(text1);
    const tokens2 = preprocess(text2);

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);

    // Intersection over Union (Jaccard)
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const jaccard = intersection.size / (set1.size + set2.size - intersection.size);

    // Simple word overlap percentage relative to the shorter document (overlap coefficient)
    // This is very effective for "resume to JD" matching where JD is usually shorter
    const overlap = intersection.size / Math.min(set1.size, set2.size);

    // TF-IDF based Cosine
    const tfidf = new TfIdf();
    tfidf.addDocument(tokens1.join(' '));
    tfidf.addDocument(tokens2.join(' '));

    const doc1Terms = {};
    tfidf.listTerms(0).forEach(item => doc1Terms[item.term] = item.tfidf);

    const doc2Terms = {};
    tfidf.listTerms(1).forEach(item => doc2Terms[item.term] = item.tfidf);

    const allTerms = new Set([...Object.keys(doc1Terms), ...Object.keys(doc2Terms)]);
    let dotProduct = 0, mag1 = 0, mag2 = 0;

    allTerms.forEach(term => {
        const v1 = doc1Terms[term] || 0;
        const v2 = doc2Terms[term] || 0;
        dotProduct += v1 * v2;
        mag1 += v1 * v1;
        mag2 += v2 * v2;
    });

    const cosine = (mag1 && mag2) ? dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;

    // Weighted ensemble: 50% Cosine (Semantic), 50% Overlap (Exact keywords)
    return (cosine * 0.5) + (overlap * 0.5);
};

export const computeScore = (candidateProfile, jobRequirements, resumeText = "") => {
    const breakdown = {
        skills: 0,
        experience: 0,
        education: 0,
        nlpContent: 0
    };

    const jobDescription = (jobRequirements.description || "").toLowerCase();
    const requiredSkills = Array.isArray(jobRequirements.requirements)
        ? jobRequirements.requirements.map(s => s.toLowerCase().trim())
        : [];

    const resumeLower = resumeText.toLowerCase();

    // 1. NLP Content Similarity (20% - Increased weight)
    const similarity = calculateSimilarity(resumeText, jobDescription);
    breakdown.nlpContent = similarity * 20;

    // 2. Skills Match (45% - Increased weight)
    if (requiredSkills.length > 0) {
        const profileSkills = (candidateProfile.skills || []).map(s => s.toLowerCase().trim());
        let matches = 0;

        requiredSkills.forEach(req => {
            // Priority 1: Explicit match in profile skills
            if (profileSkills.some(s => s === req || s.includes(req) || req.includes(s))) {
                matches += 1.0;
            }
            // Priority 2: Direct presence in resume text
            else if (resumeLower.includes(req)) {
                matches += 0.95; // High credit for finding exact keywords in resume
            }
            // Priority 3: Fuzzy match (e.g. React vs React.js)
            else if (resumeLower.replace(/[^\w]/g, '').includes(req.replace(/[^\w]/g, ''))) {
                matches += 0.85;
            }
        });

        breakdown.skills = Math.min(45, (matches / requiredSkills.length) * 45);
    }

    // 3. Experience Match (20% - Balanced weight)
    const exp = candidateProfile.yearsOfExperience ||
        (resumeText.match(/(\d+)\+?\s*years?\s+of?\s+experience/i)?.[1] ? parseInt(resumeText.match(/(\d+)\+?\s*years?\s+of?\s+experience/i)[1]) : 0);
    const reqExp = jobRequirements.experienceLevel || 0;

    let expPoints = 0;
    if (reqExp === 0) {
        expPoints = 20;
    } else {
        const ratio = exp / reqExp;
        if (ratio >= 1) expPoints = 20;
        else if (ratio >= 0.5) expPoints = 15;
        else if (ratio > 0) expPoints = 8;
        else expPoints = 4;
    }
    breakdown.experience = expPoints;

    // 4. Education Match (15%)
    let hasDegree = false;
    if (resumeLower) {
        const normalizedResume = resumeLower.replace(/\./g, '');
        const doc = nlp(normalizedResume);
        hasDegree = doc.match('(bachelor|master|phd|doctorate|btech|mtech|degree|graduate|bsc|msc|mba|bca|mca)').found;
    }

    if (hasDegree) {
        const normalizedResume = resumeLower.replace(/\./g, '');
        if (normalizedResume.includes("phd") || normalizedResume.includes("doctorate")) breakdown.education = 15;
        else if (normalizedResume.includes("master") || normalizedResume.includes("mtech") || normalizedResume.includes("mba") || normalizedResume.includes("msc") || normalizedResume.includes("mca")) breakdown.education = 14;
        else if (normalizedResume.includes("bachelor") || normalizedResume.includes("btech") || normalizedResume.includes("degree") || normalizedResume.includes("bsc") || normalizedResume.includes("bca")) breakdown.education = 12;
    } else {
        breakdown.education = 3;
    }

    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

    // Ensure that if it's the SAME text, we get close to 100
    // If similarity is extremely high, we reward the total
    const bonus = similarity > 0.9 ? (1 - similarity) * 10 : 0;

    return {
        score: Math.min(100, Math.round(totalScore + bonus)),
        breakdown: {
            skills: Math.round(breakdown.skills),
            experience: Math.round(breakdown.experience),
            education: Math.round(breakdown.education),
            profile: Math.round(breakdown.nlpContent)
        }
    };
};
