import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        unreadCount: 0,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.notifications = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification: (state, action) => {
            state.notifications = [action.payload, ...state.notifications];
            state.unreadCount += 1;
        },
        markNotificationAsRead: (state, action) => {
            const notification = state.notifications.find(n => n._id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllNotificationsAsRead: (state) => {
            state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        }
    }
});

export const {
    setNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
