import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from '@/components/ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    return (
        <div className='overflow-hidden border-none'>
            <Table>
                <TableCaption className="text-slate-400 py-6 font-medium text-[10px] uppercase tracking-widest bg-slate-50/50 border-t border-slate-100">A chronological list of your job applications</TableCaption>
                <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100 h-14">
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] px-6">Date</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Job Role</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em]">Company</TableHead>
                        <TableHead className="text-right text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] px-6">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                                    You haven't applied to any jobs yet. Start exploring!
                                </TableCell>
                            </TableRow>
                        ) : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="border-slate-50 hover:bg-slate-50/50 transition-all duration-300 group">
                                <TableCell className="px-6 py-4">
                                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{appliedJob?.createdAt?.split("T")[0]}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{appliedJob.job?.title}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-slate-600 font-bold text-xs uppercase tracking-tight">{appliedJob.job?.company?.name}</span>
                                </TableCell>
                                <TableCell className="text-right px-6 py-4">
                                    <div className='flex items-center justify-end gap-2'>
                                        <span className={`h-1.5 w-1.5 rounded-full ${appliedJob?.status === "rejected" ? 'bg-rose-400' : (['accepted', 'interview scheduled', 'interviewed', 'offer extended', 'offer accepted'].includes(appliedJob.status) ? 'bg-emerald-400' : 'bg-amber-400')}`}></span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${appliedJob?.status === "rejected" ? 'text-rose-600' : (['accepted', 'interview scheduled', 'interviewed', 'offer extended', 'offer accepted'].includes(appliedJob.status) ? 'text-emerald-600' : 'text-amber-600')}`}>
                                            {appliedJob.status.toUpperCase()}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable