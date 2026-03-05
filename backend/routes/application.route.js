import express from "express";
import { applyJob, getAppliedJobs, getApplicants, updateStatus, withdrawApplication, exportResumes, getPrepKit } from "../controllers/application.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isRecruiter } from "../middlewares/isAuthorized.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, applyJob);
router.route("/get").get(isAuthenticated, getAppliedJobs);
router.route("/:id/applicants").get(isAuthenticated, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, updateStatus);
router.route("/withdraw/:id").delete(isAuthenticated, withdrawApplication);
router.route("/:id/prep-kit").get(isAuthenticated, getPrepKit);
router.route("/:id/export-resumes").get(isAuthenticated, isRecruiter, exportResumes);

export default router;
