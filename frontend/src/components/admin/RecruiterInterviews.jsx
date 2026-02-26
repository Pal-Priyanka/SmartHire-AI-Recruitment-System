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

    if (loading) return <div className='min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-bold text-xl'>Loading Interviews...</div>;

    return (
        <div className='min-h-screen bg-slate-50 pb-10'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <div className='flex justify-between items-center mb-10'>
                    <h1 className='text-3xl font-bold text-slate-900 font-display'>Interview <span className='text-indigo-600'>Schedule</span></h1>
                    <div className='flex gap-4'>
                        <Badge className="bg-white border-slate-200 text-slate-700 shadow-sm px-4 py-1.5">{interviews.length} Total</Badge>
                        <Badge className="bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm px-4 py-1.5">{interviews.filter(i => i.status === 'scheduled').length} Upcoming</Badge>
                    </div>
                </div>

                <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
                    <Table className="bg-white">
                        <TableCaption className="text-slate-400 py-6 font-medium">Upcoming and past interviews with candidates</TableCaption>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Candidate</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Job Title</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date & Time</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Type</TableHead>
                                <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                                <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
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
                                    <TableRow key={inv._id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                                        <TableCell>
                                            <div className='flex items-center gap-3'>
                                                <div className='h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center'>
                                                    <User className='h-4 w-4 text-indigo-600' />
                                                </div>
                                                <span className='font-bold text-slate-900'>{inv.candidateId?.fullname}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-700 font-medium">{inv.jobId?.title}</TableCell>
                                        <TableCell>
                                            <div className='flex flex-col'>
                                                <span className='flex items-center gap-2 text-sm text-slate-900 font-bold'>
                                                    <Calendar className='h-3 w-3 text-emerald-600' />
                                                    {new Date(inv.scheduledDate).toLocaleDateString()}
                                                </span>
                                                <span className='flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-bold'>
                                                    <Clock className='h-3 w-3' />
                                                    {new Date(inv.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-slate-200 text-slate-500 capitalize bg-slate-50 text-[10px] font-bold">
                                                {inv.interviewType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`px-4 py-1 rounded-full text-[10px] font-bold border-none shadow-sm ${inv.status === 'scheduled' ? 'bg-indigo-50 text-indigo-600' :
                                                inv.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                                    inv.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {inv.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className='flex justify-end gap-2'>
                                                {inv.meetingLink && inv.status === 'scheduled' && (
                                                    <a href={inv.meetingLink} target="_blank" rel="noreferrer">
                                                        <Button size="sm" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 font-bold rounded-lg shadow-sm">
                                                            <Video className='h-4 w-4 mr-2' />
                                                            Join
                                                        </Button>
                                                    </a>
                                                )}
                                                {inv.status === 'scheduled' && (
                                                    <Button onClick={() => updateStatus(inv._id, 'completed')} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md shadow-indigo-100 border-none">
                                                        Mark Done
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
