import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const _pdfModule = require('pdf-parse');
const PDFParse = _pdfModule.PDFParse;
import mammoth from "mammoth";
import fs from "fs";
import axios from "axios";
import cloudinary from "../utils/cloudinary.js";

const skillsTaxonomy = [
    "JavaScript", "React", "Node.js", "Express", "MongoDB", "Python", "Java", "C++",
    "AWS", "Docker", "Kubernetes", "SQL", "TypeScript", "HTML", "CSS", "Agile",
    "Tailwind", "Git", "DevOps", "Machine Learning", "Data Analysis", "Figma", "UI/UX"
];

export const parseResume = async (pathOrUrl) => {
    try {
        const text = await extractRawText(pathOrUrl);
        if (!text) return null;

        const parsedData = {
            skills: [],
            email: "",
            phone: "",
            experience: 0,
            education: "Not Specified",
            certifications: []
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

        // Experience extraction (Advanced & Lenient)
        const expPatterns = [
            /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
            /(\d+)\+?\s*years?\s*(?:exp)/i,
            /(?:total\s*)?experience[:\s]+(\d+)\+?\s*years?/i,
            /(\d+)\+?\s*years?\s*in\s*(?:the\s*)?industry/i,
            /(\d+)\s*yrs?\s*(?:exp|experience)/i,
            /experience\s*(?:of\s*)?(\d+)\s*years?/i
        ];

        for (const pattern of expPatterns) {
            const match = text.match(pattern);
            if (match) {
                parsedData.experience = Math.max(parsedData.experience, parseInt(match[1]));
            }
        }

        // Advanced Date Range Calculation (e.g., "Jan 2018 - Mar 2022")
        const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
        // 1. Month-Year Range (e.g., "Jan 2018 - Mar 2022")
        const dateRangeRegex = /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})\s*-\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})|present|current)/gi;
        let totalMonths = 0;
        const matches = text.matchAll(dateRangeRegex);
        for (const match of matches) {
            const startYear = parseInt(match[1]);
            const endYear = match[2] ? parseInt(match[2]) : new Date().getFullYear();
            if (startYear > 1900 && endYear >= startYear) {
                totalMonths += (endYear - startYear) * 12;
            }
        }

        // 2. Year-Only Range (e.g., "2018 - 2022" or "2018-2022")
        const yearOnlyRegex = /(?:^|\s)(\d{4})\s*-\s*(\d{4}|present|current)(?:\s|$)/gi;
        const yearMatches = text.matchAll(yearOnlyRegex);
        for (const match of yearMatches) {
            const startYear = parseInt(match[1]);
            const endYear = (match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current')
                ? new Date().getFullYear()
                : parseInt(match[2]);
            if (startYear > 1900 && endYear >= startYear) {
                parsedData.experience = Math.max(parsedData.experience, endYear - startYear);
            }
        }

        if (totalMonths > 0) {
            parsedData.experience = Math.max(parsedData.experience, Math.round(totalMonths / 12));
        }

        // Education extraction (Expanded)
        const educationKeywords = [
            { key: "phd", label: "PhD" },
            { key: "doctorate", label: "PhD" },
            { key: "master", label: "Masters" },
            { key: "mba", label: "MBA" },
            { key: "m.tech", label: "M.Tech" },
            { key: "mca", label: "MCA" },
            { key: "bachelor", label: "Bachelors" },
            { key: "b.tech", label: "B.Tech" },
            { key: "btech", label: "B.Tech" },
            { key: "be", label: "B.E" },
            { key: "b.e", label: "B.E" },
            { key: "bsc", label: "B.Sc" },
            { key: "b.sc", label: "B.Sc" },
            { key: "bca", label: "BCA" },
            { key: "graduate", label: "Graduate" },
            { key: "undergraduate", label: "Graduate" }
        ];

        for (const edu of educationKeywords) {
            if (text.toLowerCase().includes(edu.key)) {
                parsedData.education = edu.label;
                break;
            }
        }

        // Certification extraction (Section-based + Keywords)
        const certKeywords = [
            "AWS", "PMP", "Google Cloud", "Azure", "CISSP", "Oracle", "Microsoft", "CompTIA", "Cisco", "CCNA",
            "Scrum Master", "Salesforce", "NPTEL", "HackerRank", "CodeChef", "LeetCode", "Udemy", "Coursera"
        ];

        // 1. Keyword match
        certKeywords.forEach(cert => {
            if (text.toLowerCase().includes(cert.toLowerCase())) {
                parsedData.certifications.push(cert);
            }
        });

        // 2. Section logic: Look for "Certifications" header and extract next few lines
        const certSectionRegex = /(?:certifications|certificates|professional\s+development|achievements|accolades|licenses|courses)[:\s]*([\s\S]{1,500})/i;
        const sectionMatch = text.match(certSectionRegex);
        if (sectionMatch) {
            const sectionText = sectionMatch[1].split(/\n\n|\r\n\r\n|[A-Z][A-Z\s,]{4,}:/)[0]; // Stop at next section
            const lines = sectionText.split(/\n|,|•|\|/).map(l => l.trim()).filter(l => l.length > 5 && l.length < 100);
            lines.forEach(line => {
                // Filter out non-cert lines (like skills or dates)
                if (!parsedData.certifications.includes(line) && !line.includes("-") && !line.match(/^\d+$/)) {
                    parsedData.certifications.push(line);
                }
            });
        }

        parsedData.certifications = [...new Set(parsedData.certifications)];

        return parsedData;

    } catch (error) {
        console.error("Error parsing resume:", error);
        return null;
    }
};

/**
 * Extract raw text from a resume file (PDF or DOCX).
 * Used by the NLP pipeline for semantic matching.
 */
export const extractRawText = async (pathOrUrl) => {
    let dataBuffer;
    let extension = pathOrUrl.split('.').pop().toLowerCase();

    try {
        if (pathOrUrl.startsWith('http')) {
            let fetchUrl = pathOrUrl;

            // Handle Cloudinary URLs specifically
            if (pathOrUrl.includes('cloudinary.com')) {
                try {
                    // Extract public ID
                    const publicId = pathOrUrl.split('/').pop().split('.')[0];

                    // 1. Discovery
                    let resource = await cloudinary.api.resource(publicId).catch(() => null);
                    if (!resource) {
                        resource = await cloudinary.api.resource(publicId, { resource_type: 'raw' }).catch(() => null);
                    }

                    if (resource && resource.secure_url) {
                        fetchUrl = resource.secure_url;
                        extension = resource.format || extension;
                        console.log(`[Parser] Resolved Cloudinary: ${publicId} directly via SDK.`);
                    }
                } catch (cloudErr) {
                    console.warn(`[Parser] Cloudinary discovery failed: ${cloudErr.message}`);
                }
            }

            // Fetch with browser-like headers
            const response = await axios.get(fetchUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*'
                },
                timeout: 10000
            });
            dataBuffer = Buffer.from(response.data);

            // Recheck type from final headers
            const contentType = response.headers['content-type'];
            if (contentType === 'application/pdf') extension = 'pdf';
            else if (contentType.includes('word') || contentType.includes('officedocument')) extension = 'docx';
        }
        else {
            // Handle local file path
            if (!fs.existsSync(pathOrUrl)) return "";
            dataBuffer = fs.readFileSync(pathOrUrl);
        }

        let text = "";
        if (extension === 'pdf') {
            try {
                const parser = new PDFParse({ data: dataBuffer });
                const result = await parser.getText();
                text = result.text;
                await parser.destroy();
            } catch (err) {
                console.error("PDF Parse error:", err);
            }
        } else if (extension === 'docx' || extension === 'doc') {
            try {
                const result = await mammoth.extractRawText({ buffer: dataBuffer });
                text = result.value;
            } catch (err) {
                console.error("Mammoth Parse error:", err);
            }
        }

        console.log(`[Parser] Extracted text length: ${text.length} for ${pathOrUrl.substring(0, 50)}...`);
        if (text.length > 0) {
            console.log(`[Parser] Text preview: ${text.substring(0, 500).replace(/\n/g, ' ')}`);
        } else {
            console.warn(`[Parser] WARNING: No text extracted from ${pathOrUrl}`);
        }
        return text ? text.trim() : "";
    } catch (error) {
        console.error("Error extracting raw text from resume:", error);
        return "";
    }
};
