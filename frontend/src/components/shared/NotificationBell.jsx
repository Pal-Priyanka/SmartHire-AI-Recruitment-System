import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { setNotifications, addNotification } from '@/redux/notificationSlice';
import api from '@/lib/api';
import { NOTIFICATION_API_END_POINT } from '@/utils/constant';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { unreadCount } = useSelector(store => store.notification);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get(NOTIFICATION_API_END_POINT);
                if (res.data.success) {
                    dispatch(setNotifications(res.data.notifications));
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        if (user) {
            fetchNotifications();
            const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
                query: { userId: user._id }
            });

            socket.on("new_notification", (notification) => {
                dispatch(addNotification(notification));
            });

            return () => socket.disconnect();
        }
    }, [user, dispatch]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all group/bell border border-transparent hover:border-slate-100 active:scale-95">
                    <Bell className="h-6 w-6 text-slate-500 group-hover/bell:text-indigo-600 transition-colors" />
                    {unreadCount > 0 && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm border-2 border-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </div>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0 bg-transparent border-none shadow-none mt-4 outline-none mr-4" align="end">
                <NotificationPanel />
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
