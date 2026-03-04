import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getRecruiterAnalytics, getCandidateAnalytics, getForecastAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.route("/recruiter").get(isAuthenticated, getRecruiterAnalytics);
router.route("/candidate").get(isAuthenticated, getCandidateAnalytics);
router.route("/forecast").get(isAuthenticated, getForecastAnalytics);

export default router;
