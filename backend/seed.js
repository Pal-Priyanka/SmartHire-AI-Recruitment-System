import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import { Application } from "./models/application.model.js";
import { Interview } from "./models/interview.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        if (process.argv.includes("--reset")) {
            console.log("Resetting database...");
            await User.deleteMany({});
            await Company.deleteMany({});
            await Job.deleteMany({});
            await Application.deleteMany({});
            await Interview.deleteMany({});
        }

        const password = await bcrypt.hash("SmartHire@123", 10);

        // 1. Create Recruiters
        const recruiters = await User.insertMany([
            { fullname: "Alex Morgan", email: "recruiter@smarthire.com", password, phoneNumber: 1234567890, role: "recruiter" },
            { fullname: "Priya Sharma", email: "hr@smarthire.com", password, phoneNumber: 9876543210, role: "recruiter" }
        ]);

        // 2. Create Companies
        const companies = await Company.insertMany([
            { name: "Tech Solutions Inc", description: "Leading tech provider", website: "https://techsolutions.com", location: "Remote", userId: recruiters[0]._id },
            { name: "Global HR Services", description: "Global recruitment agency", website: "https://globalhr.com", location: "Mumbai", userId: recruiters[1]._id }
        ]);

        // 3. Create Candidates
        const candidates = await User.insertMany([
            { fullname: "Rahul Verma", email: "candidate1@smarthire.com", password, phoneNumber: 1122334455, role: "candidate" },
            { fullname: "Anjali Singh", email: "candidate2@smarthire.com", password, phoneNumber: 2233445566, role: "candidate" },
            { fullname: "David Chen", email: "candidate3@smarthire.com", password, phoneNumber: 3344556677, role: "candidate" },
            { fullname: "Fatima Al-Hassan", email: "candidate4@smarthire.com", password, phoneNumber: 4455667788, role: "candidate" },
            { fullname: "James O'Brien", email: "candidate5@smarthire.com", password, phoneNumber: 5566778899, role: "candidate" }
        ]);

        // 4. Create Job Postings
        const jobData = [
            { title: "Junior Full Stack Developer", description: "[BEGINNER FRIENDLY] Start your career by building high-performance UIs using React and Node.js.", requirements: ["React", "Node.js", "MongoDB"], salary: 1200000, experienceLevel: 0, location: "Remote", jobType: "Internship", position: 5, company: companies[0]._id, created_by: recruiters[0]._id },
            { title: "Associate Data Scientist", description: "[BEGINNER FRIENDLY] Dive into data analytics and ML pipelines with Python and SQL.", requirements: ["Python", "TensorFlow", "SQL"], salary: 1500000, experienceLevel: 1, location: "Hyderabad", jobType: "Full-time (Entry Level)", position: 3, company: companies[0]._id, created_by: recruiters[0]._id },
            { title: "Junior UI/UX Designer", description: "[BEGINNER FRIENDLY] Create stunning visual experiences for our AI platforms using Figma.", requirements: ["Figma", "Adobe XD"], salary: 800000, experienceLevel: 0, location: "Bangalore", jobType: "Internship", position: 4, company: companies[1]._id, created_by: recruiters[1]._id },
            { title: "Graduate DevOps Engineer", description: "[BEGINNER FRIENDLY] Learn cloud infrastructure and containerization with Docker and AWS.", requirements: ["Docker", "Kubernetes", "AWS"], salary: 1400000, experienceLevel: 1, location: "Pune", jobType: "Full-time (Entry Level)", position: 2, company: companies[0]._id, created_by: recruiters[0]._id },
            { title: "Associate Product Manager", description: "[BEGINNER FRIENDLY] Support product roadmapping and agile delivery in a fast-paced team.", requirements: ["Agile", "Product Management"], salary: 1800000, experienceLevel: 1, location: "Mumbai", jobType: "Full-time (Entry Level)", position: 2, company: companies[1]._id, created_by: recruiters[1]._id },
            { title: "Junior Backend Engineer", description: "[BEGINNER FRIENDLY] Build robust server-side logic using Java and Spring Boot.", requirements: ["Java", "Spring Boot"], salary: 1100000, experienceLevel: 0, location: "Chennai", jobType: "Internship", position: 6, company: companies[0]._id, created_by: recruiters[0]._id },
            { title: "Associate Digital Marketing", description: "[BEGINNER FRIENDLY] Master SEO and SEM while driving growth for our AI products.", requirements: ["SEO", "SEM", "Analytics"], salary: 700000, experienceLevel: 1, location: "Delhi", jobType: "Full-time (Entry Level)", position: 3, company: companies[1]._id, created_by: recruiters[1]._id },
            { title: "HR Associate (Intern)", description: "[BEGINNER FRIENDLY] Learn the ropes of talent acquisition and employee engagement.", requirements: ["Human Resources", "Recruitment"], salary: 600000, experienceLevel: 0, location: "Hyderabad", jobType: "Internship", position: 3, company: companies[1]._id, created_by: recruiters[1]._id },
            { title: "Junior Cloud Engineer", description: "[BEGINNER FRIENDLY] Assist in implementing scalable cloud solutions on AWS and Azure.", requirements: ["AWS", "GCP", "Azure"], salary: 1600000, experienceLevel: 1, location: "Remote", jobType: "Full-time (Entry Level)", position: 2, company: companies[0]._id, created_by: recruiters[0]._id },
            { title: "Associate QA Automation", description: "[BEGINNER FRIENDLY] Start your journey in software testing with Selenium and Cypress.", requirements: ["Selenium", "Cypress"], salary: 900000, experienceLevel: 0, location: "Bangalore", jobType: "Internship", position: 5, company: companies[1]._id, created_by: recruiters[1]._id }
        ];

        const jobs = await Job.insertMany(jobData);

        // 5. Create Applications
        const statuses = ['applied', 'screening', 'screened', 'interview scheduled', 'interviewed', 'offer extended', 'offer accepted', 'rejected'];
        const applications = [];

        candidates.forEach((candidate, cIdx) => {
            jobs.forEach((job, jIdx) => {
                // Not every candidate applies to every job
                if ((cIdx + jIdx) % 2 === 0) {
                    const score = 60 + Math.floor(Math.random() * 35); // Realistic high scores
                    applications.push({
                        job: job._id,
                        applicant: candidate._id,
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        aiScore: score,
                        scoreBreakdown: {
                            skills: score - 5,
                            experience: 80,
                            education: 75,
                            profile: 90
                        },
                        statusHistory: [
                            { status: 'applied', timestamp: new Date(Date.now() - 86400000 * 2) }
                        ]
                    });
                }
            });
        });

        const createdApps = await Application.insertMany(applications);

        // Update jobs with application references
        for (const app of createdApps) {
            await Job.findByIdAndUpdate(app.job, { $push: { applications: app._id } });
        }

        // 6. Create Interviews
        const interviewData = [
            { application: createdApps[0]._id, candidate: createdApps[0].applicant, job: createdApps[0].job, interviewer: recruiters[0]._id, scheduledDate: "2026-02-26", scheduledTime: "10:00 AM", duration: 60, type: "Technical", format: "Video", status: "scheduled" },
            { application: createdApps[1]._id, candidate: createdApps[1].applicant, job: createdApps[1].job, interviewer: recruiters[1]._id, scheduledDate: "2026-02-26", scheduledTime: "02:00 PM", duration: 60, type: "HR", format: "Video", status: "scheduled" },
            { application: createdApps[2]._id, candidate: createdApps[2].applicant, job: createdApps[2].job, interviewer: recruiters[0]._id, scheduledDate: "2026-02-25", scheduledTime: "04:00 PM", duration: 45, type: "Technical", format: "Video", status: "completed" },
            { application: createdApps[3]._id, candidate: createdApps[3].applicant, job: createdApps[3].job, interviewer: recruiters[1]._id, scheduledDate: "2026-02-27", scheduledTime: "11:30 AM", duration: 60, type: "Final", format: "Video", status: "scheduled" },
            { application: createdApps[4]._id, candidate: createdApps[4].applicant, job: createdApps[4].job, interviewer: recruiters[0]._id, scheduledDate: "2026-02-28", scheduledTime: "01:00 PM", duration: 90, type: "Technical", format: "In-Person", status: "scheduled" }
        ];

        await Interview.insertMany(interviewData);

        console.log("Database seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
