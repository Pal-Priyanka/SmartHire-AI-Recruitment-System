import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";
import dotenv from "dotenv";

dotenv.config();

const addMoreJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        // Find recruiters
        const alex = await User.findOne({ email: "recruiter@smarthire.com" });
        const priya = await User.findOne({ email: "hr@smarthire.com" });

        if (!alex || !priya) {
            console.error("Recruiters not found. Please run seed script first.");
            process.exit(1);
        }

        // Create 2 New Companies
        const newCompanies = await Company.insertMany([
            { name: "CyberCore Systems", description: "Advanced cybersecurity and infrastructure solutions.", website: "https://cybercore.io", location: "Bangalore", userId: alex._id },
            { name: "AeroAI Dynamics", description: "Specializing in autonomous flight and AI-driven drone tech.", website: "https://aeroai.tech", location: "Remote", userId: alex._id }
        ]);

        const allCompanies = [
            await Company.findOne({ name: "Tech Solutions Inc" }),
            await Company.findOne({ name: "Global HR Services" }),
            ...newCompanies
        ];

        const jobTitles = [
            "Junior AI Engineer (Healthcare)",
            "Associate ML Engineer (Fintech)",
            "Junior Computer Vision Specialist",
            "Junior Full Stack Developer",
            "Associate Deep Learning Engineer",
            "Intern - NLP Research",
            "Junior AI Infrastructure Engineer",
            "Associate MLOps Engineer",
            "Junior Data Engineer",
            "Graduate Software Engineer",
            "Associate AI Developer",
            "Intern - Robotics Software",
            "Junior Backend Developer",
            "Junior Frontend Engineer",
            "Junior Generative AI Engineer",
            "Junior Systems Architect",
            "Associate Database Admin",
            "Junior Cybersecurity Analyst",
            "Intern - AI Cloud Systems",
            "Junior Automation Tester"
        ];

        const jobRequirements = [
            ["Python", "PyTorch", "Healthcare Data"],
            ["TensorFlow", "Pandas", "Statistical Analysis"],
            ["OpenCV", "C++", "Image Processing"],
            ["React", "Next.js", "TypeScript"],
            ["Deep Learning", "CNN", "Transformer Models"],
            ["NLP", "LLMs", "HuggingFace"],
            ["JavaScript", "Node.js", "Tailwind CSS"],
            ["Docker", "Kubernetes", "GPU Computing"],
            ["CI/CD", "Prometheus", "Model Deployment"],
            ["Apache Spark", "ETL", "Big Data"],
            ["PyTorch", "OpenCV", "Real-time Processing"],
            ["React", "Python", "OpenAI API"],
            ["Reinforcement Learning", "Gym", "Simulation"],
            ["Python", "FastAPI", "PostgreSQL"],
            ["React", "Framer Motion", "Tailwind"],
            ["Stable Diffusion", "Prompt Engineering", "GANs"],
            ["Microservices", "System Design", "Scalability"],
            ["MongoDB", "Redis", "Performance Tuning"],
            ["ROS", "C++", "Control Systems"],
            ["Security Protocols", "ML Security", "Network Forensics"]
        ];

        const jobsToAdd = jobTitles.map((title, index) => {
            const company = allCompanies[index % allCompanies.length];
            const creator = (index % 2 === 0) ? alex : priya;

            return {
                title,
                description: `[BEGINNER FRIENDLY] We are looking for an enthusiastic ${title} to join our growing team. You will be mentored by seniors and work on market-leading projects. This is a perfect start for your career in ${title.split(' ')[1] || 'Tech'}.`,
                requirements: jobRequirements[index],
                salary: 600000 + (Math.floor(Math.random() * 10) * 100000),
                experienceLevel: Math.floor(Math.random() * 2), // 0-1 years
                location: ["Remote", "Bangalore", "Hyderabad", "Mumbai", "Pune"][index % 5],
                jobType: Math.random() > 0.5 ? "Internship" : "Full-time (Entry Level)",
                position: 2 + Math.floor(Math.random() * 5),
                company: company._id,
                created_by: creator._id,
                status: 'active'
            };
        });

        await Job.insertMany(jobsToAdd);

        console.log(`Successfully added 20 new job openings and 2 new companies.`);
        process.exit(0);
    } catch (error) {
        console.error("Error adding jobs:", error);
        process.exit(1);
    }
};

addMoreJobs();
