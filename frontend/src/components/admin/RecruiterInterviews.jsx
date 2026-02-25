import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, Video, FileText, User } from 'lucide-react';
import api from '@/lib/api';
import { INTERVIEW_API_END_POINT } from '@/utils/constant';

const RecruiterInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await api.get(`${INTERVIEW_API_END_POINT}/recruiter`);
                if (res.data.success) {
                    setInterviews(res.data.interviews);
                }
            } catch (error) {
                console.error("Error fetching interviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const res = await api.put(`${INTERVIEW_API_END_POINT}/${id}/status`, { status });
            if (res.data.success) {
                setInterviews(prev => prev.map(inv => inv._id === id ? { ...inv, status } : inv));
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (loading) return <div className='min-h-screen bg-[#0F172A] text-white flex items-center justify-center'>Loading Interviews...</div>;

    return (
        <div className='min-h-screen bg-[#0F172A] pb-10'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <div className='flex justify-between items-center mb-10'>
                    <h1 className='text-3xl font-bold text-white'>Interview <span className='text-indigo-500'>Schedule</span></h1>
                    <div className='flex gap-4'>
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{interviews.length} Total</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{interviews.filter(i => i.status === 'scheduled').length} Upcoming</Badge>
                    </div>
                </div>

                <div className='bg-[#1E293B] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden'>
                    <Table className="text-white">
                        <TableCaption className="text-gray-500">Upcoming and past interviews with candidates</TableCaption>
                        <TableHeader>
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-gray-400">Candidate</TableHead>
                                <TableHead className="text-gray-400">Job Title</TableHead>
                                <TableHead className="text-gray-400">Date & Time</TableHead>
                                <TableHead className="text-gray-400">Type</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-right text-gray-400">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-gray-500">
                                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        No interviews scheduled yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interviews.map((inv) => (
                                    <TableRow key={inv._id} className="border-gray-800 hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <div className='flex items-center gap-3'>
                                                <div className='h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center'>
                                                    <User className='h-4 w-4 text-indigo-400' />
                                                </div>
                                                <span className='font-medium text-white'>{inv.candidateId?.fullname}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{inv.jobId?.title}</TableCell>
                                        <TableCell>
                                            <div className='flex flex-col'>
                                                <span className='flex items-center gap-2 text-sm'>
                                                    <Calendar className='h-3 w-3 text-emerald-400' />
                                                    {new Date(inv.scheduledDate).toLocaleDateString()}
                                                </span>
                                                <span className='flex items-center gap-2 text-xs text-gray-400 mt-1'>
                                                    <Clock className='h-3 w-3' />
                                                    {new Date(inv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-gray-700 text-gray-400 capitalize">
                                                {inv.interviewType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`px-3 py-1 rounded-full text-[10px] font-bold border-none ${inv.status === 'scheduled' ? 'bg-indigo-500/20 text-indigo-400' :
                                                    inv.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        inv.status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                {inv.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className='flex justify-end gap-2'>
                                                {inv.meetingLink && inv.status === 'scheduled' && (
                                                    <a href={inv.meetingLink} target="_blank" rel="noreferrer">
                                                        <Button size="sm" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-none">
                                                            <Video className='h-4 w-4 mr-2' />
                                                            Join
                                                        </Button>
                                                    </a>
                                                )}
                                                {inv.status === 'scheduled' && (
                                                    <Button onClick={() => updateStatus(inv._id, 'completed')} size="sm" className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-none">
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default RecruiterInterviews;
