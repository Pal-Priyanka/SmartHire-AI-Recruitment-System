import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { ExternalLink, MoreHorizontal, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import api from '@/lib/api';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = ({ isGlobal = false }) => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        try {
            api.defaults.withCredentials = true;
            const res = await api.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            if (res.data.success) {
                toast.success(res.data.message);

                // Update local state by re-mapping applicants if they exist in store
                // Or simply reloading to be safe for demo
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-600';
        if (score >= 60) return 'text-amber-500';
        return 'text-rose-600';
    }

    const getProgressColor = (score) => {
        if (score >= 80) return 'bg-emerald-400';
        if (score >= 60) return 'bg-amber-400';
        return 'bg-rose-400';
    }

    return (
        <div className='bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden'>
            <Table>
                <TableCaption className="text-slate-400 py-6 font-medium text-xs uppercase tracking-widest bg-slate-50/50 border-t border-slate-100">A list of recently applied candidates</TableCaption>
                <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Candidate</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Contact Info</TableHead>
                        {isGlobal && <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Applied For</TableHead>}
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Resume</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">AI Analysis</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Applied On</TableHead>
                        <TableHead className="text-right text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <TableRow key={item._id} className="border-slate-50 hover:bg-slate-50/50 transition-all duration-300 group">
                                <TableCell className="px-6 py-4">
                                    <div className='flex flex-col'>
                                        <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{item?.applicant?.fullname}</span>
                                        <span className="text-[10px] text-slate-500 font-bold tracking-wider">{item?.applicant?.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-slate-600 font-medium text-xs tracking-widest">{item?.applicant?.phoneNumber || "N/A"}</span>
                                </TableCell>
                                {isGlobal && (
                                    <TableCell className="py-4">
                                        <span className="text-slate-900 font-black uppercase tracking-tight text-xs">{item?.job?.title || "N/A"}</span>
                                    </TableCell>
                                )}
                                <TableCell className="py-4">
                                    {
                                        item.applicant?.profile?.resume ? (
                                            <a className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">
                                                Resume <ExternalLink className='w-3 h-3' />
                                            </a>
                                        ) : <span className="text-slate-300 font-black uppercase tracking-widest text-[9px]">No Files</span>
                                    }
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className='flex items-center gap-2'>
                                        <div className={`h-2 w-12 bg-slate-100 rounded-full overflow-hidden hidden md:block`}>
                                            <div
                                                className={`h-full rounded-full ${getProgressColor(item.aiScore)}`}
                                                style={{ width: `${item.aiScore || 0}%` }}
                                            ></div>
                                        </div>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div className='flex items-center gap-1 cursor-help group/score'>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${getScoreColor(item.aiScore)}`}>
                                                        {item.aiScore || 0}%
                                                    </span>
                                                    <Info className="w-3 h-3 text-slate-300 group-hover/score:text-indigo-400 transition-colors" />
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-5 bg-white/95 backdrop-blur-xl border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[1.5rem]" side="top" align="start">
                                                <div className='space-y-4'>
                                                    <div>
                                                        <h4 className='text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1'>AI Intelligence</h4>
                                                        <p className='text-[9px] text-slate-400 font-bold uppercase tracking-wider'>Score Breakdown</p>
                                                    </div>

                                                    <div className='space-y-3.5'>
                                                        {[
                                                            { label: 'Technical Skills', value: item?.scoreBreakdown?.skills || 0, color: 'bg-emerald-400' },
                                                            { label: 'Work Experience', value: item?.scoreBreakdown?.experience || 0, color: 'bg-indigo-400' },
                                                            { label: 'Education Level', value: item?.scoreBreakdown?.education || 0, color: 'bg-amber-400' },
                                                            { label: 'Semantic Match', value: item?.scoreBreakdown?.profile || 0, color: 'bg-slate-400' }
                                                        ].map((s, i) => (
                                                            <div key={i} className='space-y-1.5'>
                                                                <div className='flex justify-between items-center'>
                                                                    <span className='text-[9px] font-black text-slate-500 uppercase tracking-widest'>{s.label}</span>
                                                                    <span className='text-[10px] font-black text-slate-900'>{s.value}%</span>
                                                                </div>
                                                                <div className='h-1 w-full bg-slate-50 rounded-full overflow-hidden'>
                                                                    <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.value}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className='pt-3 border-t border-slate-50'>
                                                        <p className='text-[8px] text-slate-400 font-medium leading-relaxed italic'>
                                                            Scored using TF-IDF similarity and weighted profile analysis.
                                                        </p>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none">
                                        {item?.applicant?.createdAt ? item.applicant.createdAt.split("T")[0] : "Recently"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right px-6 py-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-52 bg-white/95 backdrop-blur-xl border-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] p-2 rounded-2xl" align="end">
                                            <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2 border-b border-slate-50 mb-1'>Update Status</p>
                                            {
                                                shortlistingStatus.map((status, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="ghost"
                                                        onClick={() => statusHandler(status, item?._id)}
                                                        className={`flex items-center justify-start gap-4 w-full px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-slate-50 group h-auto`}
                                                    >
                                                        <div className={`h-2 w-2 rounded-full ${status === 'Accepted' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                                        <span className={`text-[11px] font-black uppercase tracking-widest ${status === 'Accepted' ? 'text-slate-600 group-hover:text-emerald-600' : 'text-slate-600 group-hover:text-rose-600'}`}>
                                                            {status}
                                                        </span>
                                                    </Button>
                                                ))
                                            }
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default ApplicantsTable
