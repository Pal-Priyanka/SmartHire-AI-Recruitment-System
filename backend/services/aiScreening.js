export const computeScore = (candidateProfile, jobRequirements) => {
    let breakdown = {
        skills: 0,
        experience: 0,
        education: 0,
        profile: 0
    };

    // 1. Skills Match (40%)
    const candidateSkills = candidateProfile.skills?.map(s => s.toLowerCase()) || [];
    const requiredSkills = jobRequirements?.map(s => s.toLowerCase()) || [];

    if (requiredSkills.length > 0) {
        const matches = requiredSkills.filter(req => {
            // Simple synonym expansion
            const synonyms = {
                "js": ["javascript"],
                "javascript": ["js"],
                "ml": ["machine learning"],
                "machine learning": ["ml"],
                "react": ["reactjs", "react.js"],
                "reactjs": ["react", "react.js"],
                "react.js": ["react", "reactjs"]
            };

            if (candidateSkills.includes(req)) return true;

            const syns = synonyms[req] || [];
            return syns.some(s => candidateSkills.includes(s));
        });

        breakdown.skills = (matches.length / requiredSkills.length) * 40;
    }

    // 2. Experience Match (30%)
    // ExperienceLevel: 1: Entry, 2: Mid, 3: Senior (mapped to 0-2, 2-5, 5+)
    const exp = candidateProfile.yearsOfExperience || 0;
    const reqExp = jobRequirements.experienceLevel || 0;
    // Manual mapping for demo
    let expPoints = 0;
    if (reqExp === 0) expPoints = 30; // Entry
    else if (reqExp <= 2) expPoints = exp >= 0 ? 30 : 15;
    else if (reqExp <= 5) expPoints = exp >= 2 ? 30 : (exp >= 0 ? 15 : 5);
    else expPoints = exp >= 5 ? 30 : (exp >= 2 ? 15 : 5);

    breakdown.experience = expPoints;

    // 3. Education Match (20%)
    const edu = candidateProfile.educationLevel?.toLowerCase() || "";
    if (edu.includes("phd")) breakdown.education = 20;
    else if (edu.includes("master") || edu.includes("m.tech")) breakdown.education = 18;
    else if (edu.includes("bachelor") || edu.includes("b.tech")) breakdown.education = 15;
    else if (edu.includes("diploma")) breakdown.education = 10;
    else breakdown.education = 5;

    // 4. Profile Completeness (10%)
    if (candidateProfile.resume) breakdown.profile += 4;
    if (candidateProfile.phoneNumber) breakdown.profile += 2;
    if (candidateProfile.bio) breakdown.profile += 2;
    if (candidateProfile.skills?.length >= 3) breakdown.profile += 2;

    const totalScore = breakdown.skills + breakdown.experience + breakdown.education + breakdown.profile;

    return {
        score: Math.round(totalScore),
        breakdown
    };
};
