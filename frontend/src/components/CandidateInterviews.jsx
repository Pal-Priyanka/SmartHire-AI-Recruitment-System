import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, Video, User } from 'lucide-react';
import api from '@/lib/api';
import { INTERVIEW_API_END_POINT } from '@/utils/constant';

const CandidateInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await api.get(`${INTERVIEW_API_END_POINT}/my-interviews`);
                if (res.data.success) {
                    setInterviews(res.data.interviews);
                }
            } catch (error) {
                console.error("Error fetching candidate interviews:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInterviews();
    }, []);

    if (loading) return <div className='min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-bold text-xl'>Loading Your Interviews...</div>;

    return (
        <div className='min-h-screen bg-slate-50 pb-10'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4'>
                <div className='flex justify-between items-center mb-10'>
                    <h1 className='text-3xl font-black text-slate-900 uppercase tracking-tighter'>Your <span className='text-indigo-600'>Interviews</span></h1>
                    <div className='flex gap-4'>
                        <Badge className="bg-white border-slate-200 text-slate-700 shadow-sm px-4 py-1.5 font-black lowercase tracking-widest text-[10px]">{interviews.length} Total</Badge>
                    </div>
                </div>

                <div className='bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden'>
                    <Table>
                        <TableCaption className="text-slate-400 py-6 font-medium text-[10px] uppercase tracking-widest bg-slate-50/50 border-t border-slate-100">Your upcoming and past interview schedule</TableCaption>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100 h-14">
                                <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] px-6">Interviewer</TableHead>
                                <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Position</TableHead>
                                <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Date & Time</TableHead>
                                <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Focus Area</TableHead>
                                <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Status</TableHead>
                                <TableHead className="text-right text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                        <Calendar className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                        You have no interviews scheduled at this time.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interviews.map((inv) => (
                                    <TableRow key={inv._id} className="border-slate-50 hover:bg-slate-50/50 transition-all duration-300 group">
                                        <TableCell className="px-6 py-4">
                                            <div className='flex items-center gap-3'>
                                                <div className='h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors'>
                                                    <User className='h-4 w-4 text-slate-400 group-hover:text-indigo-600' />
                                                </div>
                                                <span className='font-black text-slate-900 uppercase tracking-tight text-sm'>{inv.interviewer?.fullname || "Hiring Manager"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className='font-black text-slate-600 uppercase tracking-tight text-xs'>{inv.job?.title}</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className='flex flex-col gap-1'>
                                                <span className='flex items-center gap-2 text-[10px] text-slate-900 font-black uppercase tracking-widest'>
                                                    <Calendar className='h-3 w-3 text-emerald-500' />
                                                    {inv.scheduledDate}
                                                </span>
                                                <span className='flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest'>
                                                    <Clock className='h-3 w-3' />
                                                    {inv.scheduledTime}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className="bg-white text-slate-600 border border-slate-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                {inv.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className='flex items-center gap-2'>
                                                <span className={`h-1.5 w-1.5 rounded-full ${inv.status === 'scheduled' ? 'bg-indigo-400' : inv.status === 'completed' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'scheduled' ? 'text-indigo-600' : inv.status === 'completed' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6 py-4">
                                            {inv.meetLink && inv.status === 'scheduled' && (
                                                <a href={inv.meetLink.startsWith('http') ? inv.meetLink : `https://${inv.meetLink}`} target="_blank" rel="noreferrer">
                                                    <Button variant="outline" className="h-10 px-6 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all">
                                                        <Video className='h-3.5 w-3.5 mr-2' />
                                                        Join Meeting
                                                    </Button>
                                                </a>
                                            )}
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

export default CandidateInterviews;
