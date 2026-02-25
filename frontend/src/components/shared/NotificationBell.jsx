import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import api from '@/lib/api';
import { NOTIFICATION_API_END_POINT } from '@/utils/constant';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get(NOTIFICATION_API_END_POINT);
                if (res.data.success) {
                    setNotifications(res.data.notifications);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        if (user) {
            fetchNotifications();
            const socket = io("http://localhost:5000", { query: { userId: user._id } });

            socket.on("new_notification", (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            return () => socket.disconnect();
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`${NOTIFICATION_API_END_POINT}/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors">
                    <Bell className="h-6 w-6 text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1E293B] border-gray-700 text-white p-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    {unreadCount > 0 && <span className="text-xs text-indigo-400">{unreadCount} new</span>}
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">No new notifications</p>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                className={`p-3 rounded-lg border leading-tight transition-colors cursor-pointer ${n.isRead ? 'bg-transparent border-gray-800' : 'bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20'}`}
                            >
                                <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-300' : 'text-white'}`}>{n.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                                <p className="text-[10px] text-gray-600 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
