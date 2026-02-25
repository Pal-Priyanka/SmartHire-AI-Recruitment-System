import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getRecruiterAnalytics, getCandidateAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.route("/recruiter").get(isAuthenticated, getRecruiterAnalytics);
router.route("/candidate").get(isAuthenticated, getCandidateAnalytics);

export default router;
