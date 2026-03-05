import React, { useState } from 'react';
import { Bell, Check, Trash2, Clock, Calendar, CheckCircle2, Search, Award, Briefcase, Sparkles, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useDispatch, useSelector } from 'react-redux';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/redux/notificationSlice';
import api from '@/lib/api';
import { NOTIFICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const NotificationPanel = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector(store => store.notification);
    const [sustainData, setSustainData] = useState({});

    const handleRead = async (id) => {
        try {
            const res = await api.put(`${NOTIFICATION_API_END_POINT}/${id}/read`);
            if (res.data.success) {
                dispatch(markNotificationAsRead(id));
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await api.put(`${NOTIFICATION_API_END_POINT}/read-all`);
            if (res.data.success) {
                dispatch(markAllNotificationsAsRead());
                toast.success("All caught up!");
            }
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleDeleteJob = async (jobId, notificationId) => {
        try {
            const res = await api.delete(`${JOB_API_END_POINT}/delete/${jobId}`);
            if (res.data.success) {
                toast.success(res.data.message);
                handleRead(notificationId);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete job");
        }
    };

    const handleSustainJob = async (jobId, notificationId) => {
        const newDeadline = sustainData[notificationId];
        if (!newDeadline) {
            toast.error("Set a new deadline first!");
            return;
        }

        try {
            const isoDeadline = new Date(newDeadline).toISOString();
            const res = await api.put(`${JOB_API_END_POINT}/update/${jobId}`, { applyBy: isoDeadline });
            if (res.data.success) {
                toast.success("Deadline extended!");
                handleRead(notificationId);
                const newSustainData = { ...sustainData };
                delete newSustainData[notificationId];
                setSustainData(newSustainData);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to extend deadline");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'application_status': return <Briefcase className="h-4 w-4 text-indigo-500" />;
            case 'interview_scheduled': return <Calendar className="h-4 w-4 text-amber-500" />;
            case 'job_expiry': return <Clock className="h-4 w-4 text-rose-500" />;
            default: return <Sparkles className="h-4 w-4 text-purple-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full font-black animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time platform updates</p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all rounded-xl h-8 px-3"
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] p-6 space-y-4 custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                        <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <Bell className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="font-black text-xs uppercase tracking-widest">Everything is quiet</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`p-5 rounded-3xl border transition-all duration-300 relative group ${n.isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-indigo-50/30 border-indigo-100/50 shadow-sm hover:shadow-md'}`}
                        >
                            <div className="flex gap-4">
                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${n.isRead ? 'bg-slate-50' : 'bg-white border border-indigo-100'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className={`text-sm font-black tracking-tight truncate ${n.isRead ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</h4>
                                        {!n.isRead && (
                                            <button
                                                onClick={() => handleRead(n._id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-indigo-100 rounded-lg text-indigo-600"
                                                title="Mark as read"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.message}</p>

                                    {n.type === 'job_expiry' && !n.isRead && (
                                        <div className="mt-5 p-4 bg-white rounded-2xl border border-rose-100/50 space-y-4 shadow-sm">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Set Extension Deadline</Label>
                                                <Input
                                                    type="datetime-local"
                                                    className="h-9 text-xs rounded-xl focus-visible:ring-indigo-500/20"
                                                    value={sustainData[n._id] || ""}
                                                    onChange={(e) => setSustainData({ ...sustainData, [n._id]: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSustainJob(n.data.jobId, n._id)}
                                                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] h-9 rounded-xl shadow-lg shadow-slate-100"
                                                >
                                                    Extend
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteJob(n.data.jobId, n._id)}
                                                    className="flex-1 border-rose-100 text-rose-600 hover:bg-rose-50 font-black uppercase tracking-widest text-[9px] h-9 rounded-xl"
                                                >
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
                <Button className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100">
                    View Activity Log
                </Button>
            </div>
        </div>
    );
};

export default NotificationPanel;
