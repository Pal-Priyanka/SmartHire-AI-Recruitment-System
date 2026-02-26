import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    return (
        <div className='bg-white border border-slate-200 rounded-xl overflow-hidden'>
            <Table className="bg-white">
                <TableCaption className="text-slate-400 py-6 font-medium">A chronological list of your job applications</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-t-0">
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Job Role</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Company</TableHead>
                        <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">
                                    You haven't applied to any jobs yet. Start exploring!
                                </TableCell>
                            </TableRow>
                        ) : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                                <TableCell className="text-slate-500 font-medium text-sm">{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className="font-bold text-slate-900 text-sm">{appliedJob.job?.title}</TableCell>
                                <TableCell className="text-slate-600 text-sm font-medium">{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`px-4 py-1 rounded-full text-[10px] font-bold border-none shadow-sm ${appliedJob?.status === "rejected" ? 'bg-rose-50 text-rose-600' :
                                        appliedJob.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                            'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {appliedJob.status.toUpperCase()}
                                    </Badge>
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