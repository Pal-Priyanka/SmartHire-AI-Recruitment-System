import { Notification } from "../models/notification.model.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(20);
        return res.status(200).json({ notifications, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
        return res.status(200).json({ message: "Notification marked as read", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.id;
        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        return res.status(200).json({ message: "All notifications marked as read", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const createNotification = async (recipient, type, title, message, link = "", data = {}) => {
    try {
        const notification = await Notification.create({ recipient, type, title, message, link, data });

        // Emit real-time notification via Socket.io
        const receiverSocketId = getReceiverSocketId(recipient);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("new_notification", notification);
        }

        return notification;
    } catch (error) {
        console.log("Error creating notification:", error);
    }
};
