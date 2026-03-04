import express from "express";
import { login, logout, register, updateProfile, getMe, changePassword, bookmarkJob } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMe);
router.route("/change-password").put(isAuthenticated, changePassword);
router.route("/profile/update").post(isAuthenticated, singleUpload, updateProfile);
router.route("/bookmark/:id").post(isAuthenticated, bookmarkJob);

export default router;

