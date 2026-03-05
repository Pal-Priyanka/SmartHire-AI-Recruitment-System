import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, updateJob, deleteJob, getJobMatch, getJobRecommendations, getJobOptimization } from "../controllers/job.controller.js";
import { exportResumes } from "../controllers/application.controller.js";
import { isCandidate, isRecruiter } from "../middlewares/isAuthorized.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, isRecruiter, postJob);
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/recommendations").get(isAuthenticated, isCandidate, getJobRecommendations);
router.route("/:id/optimize").get(isAuthenticated, isCandidate, getJobOptimization);
router.route("/get/:id").get(isAuthenticated, getJobById);
router.route("/update/:id").put(isAuthenticated, isRecruiter, updateJob);
router.route("/delete/:id").delete(isAuthenticated, isRecruiter, deleteJob);
router.route("/match/:id").get(isAuthenticated, getJobMatch);
router.route("/:id/export-resumes").get(isAuthenticated, isRecruiter, exportResumes);

export default router;
