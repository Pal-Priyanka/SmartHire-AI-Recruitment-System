import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.route("/").get(isAuthenticated, getNotifications);
router.route("/read-all").put(isAuthenticated, markAllAsRead);
router.route("/:id/read").put(isAuthenticated, markAsRead);

export default router;
