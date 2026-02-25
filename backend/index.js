import { app, server } from "./socket/socket.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import interviewRoute from "./routes/interview.route.js";
import analyticsRoute from "./routes/analytics.route.js";
import notificationRoute from "./routes/notification.route.js";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}

app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;


// api's
app.use("/api/auth", userRoute); // login, register, logout, me, change-password
app.use("/api/users", userRoute); // profile routes
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/companies", companyRoute); // Retaining company routes as they are useful for recruiters
app.use("/api/interviews", interviewRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/notifications", notificationRoute);


server.listen(PORT, () => {
    connectDB();
    console.log(`Server running at port ${PORT}`);
})