import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { scheduleInterview, getRecruiterInterviews, getCandidateInterviews, updateInterviewStatus } from "../controllers/interview.controller.js";

const router = express.Router();

router.route("/").post(isAuthenticated, scheduleInterview);
router.route("/").get(isAuthenticated, getRecruiterInterviews);
router.route("/my-interviews").get(isAuthenticated, getCandidateInterviews);
router.route("/:id/status").put(isAuthenticated, updateInterviewStatus);

export default router;
