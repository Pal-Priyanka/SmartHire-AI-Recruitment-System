import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import api from '@/lib/api';
import { NOTIFICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import axios from 'axios';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [sustainData, setSustainData] = useState({}); // { notificationId: newDeadline }
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
            const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { query: { userId: user._id } });

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

    const handleDeleteJob = async (jobId, notificationId) => {
        try {
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
                markAsRead(notificationId);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete job");
        }
    };

    const handleSustainJob = async (jobId, notificationId) => {
        const newDeadline = sustainData[notificationId];
        if (!newDeadline) {
            toast.error("Please select a new deadline first!");
            return;
        }

        try {
            console.log("Sustaining job:", jobId, "with new deadline:", newDeadline);
            const isoDeadline = new Date(newDeadline).toISOString();
            const res = await axios.put(`${JOB_API_END_POINT}/update/${jobId}`, { applyBy: isoDeadline }, { withCredentials: true });
            console.log("Sustain response:", res.data);
            if (res.data.success) {
                toast.success("Job deadline updated successfully!");
                markAsRead(notificationId);
                // Clear state
                const newSustainData = { ...sustainData };
                delete newSustainData[notificationId];
                setSustainData(newSustainData);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to sustain job");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-all group">
                    <Bell className="h-6 w-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-bounce border-2 border-white">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-96 bg-white border-slate-100 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl text-slate-900 tracking-tight">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{unreadCount} new</span>}
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-10 text-center opacity-40'>
                            <Bell className='h-12 w-12 text-slate-300 mb-2' />
                            <p className="text-slate-500 text-sm font-bold">Inbox zero! No notifications.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => !n.isRead && markAsRead(n._id)}
                                className={`p-4 rounded-2xl border leading-tight transition-all cursor-pointer group ${n.isRead ? 'bg-white border-slate-50 hover:bg-slate-50' : 'bg-indigo-50/50 border-indigo-100 hover:bg-indigo-50 shadow-sm'}`}
                            >
                                <div className='flex items-start gap-3'>
                                    {!n.isRead && <span className='h-2 w-2 bg-indigo-600 rounded-full mt-1.5 shrink-0'></span>}
                                    <div>
                                        <p className={`text-sm font-black tracking-tight ${n.isRead ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{n.message}</p>

                                        {n.type === 'job_expiry' && !n.isRead && (
                                            <div className="mt-4 space-y-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col gap-2">
                                                    <Label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">New Deadline (for Sustain)</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        className="h-8 text-xs rounded-lg"
                                                        value={sustainData[n._id] || ""}
                                                        onChange={(e) => setSustainData({ ...sustainData, [n._id]: e.target.value })}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg"
                                                        onClick={() => handleSustainJob(n.data.jobId, n._id)}
                                                    >
                                                        Sustain
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 border-rose-100 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase tracking-widest h-8 rounded-lg"
                                                        onClick={() => handleDeleteJob(n.data.jobId, n._id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-slate-400 mt-3 font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default NotificationBell;
