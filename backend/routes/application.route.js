import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAllApplicants, getAppliedJobs, updateStatus, withdrawApplication } from "../controllers/application.controller.js";
import { isCandidate, isRecruiter } from "../middlewares/isAuthorized.js";

const router = express.Router();

router.route("/apply/:id").get(isAuthenticated, isCandidate, applyJob);
router.route("/get").get(isAuthenticated, isCandidate, getAppliedJobs);
router.route("/getall").get(isAuthenticated, isRecruiter, getAllApplicants);
router.route("/:id/applicants").get(isAuthenticated, isRecruiter, getApplicants);
router.route("/status/:id/update").post(isAuthenticated, isRecruiter, updateStatus);
router.route("/withdraw/:id").delete(isAuthenticated, isCandidate, withdrawApplication);


export default router;

