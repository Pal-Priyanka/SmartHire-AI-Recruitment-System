import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs } = useSelector(store => store.job);
    return (
        <div className='bg-[#1E293B] border-none'>
            <Table className="text-white">
                <TableCaption className="text-gray-500 py-6">A chronological list of your job applications</TableCaption>
                <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold uppercase text-xs">Date</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-xs">Job Role</TableHead>
                        <TableHead className="text-gray-400 font-bold uppercase text-xs">Company</TableHead>
                        <TableHead className="text-right text-gray-400 font-bold uppercase text-xs">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                                    You haven't applied to any jobs yet. Start exploring!
                                </TableCell>
                            </TableRow>
                        ) : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id} className="border-gray-800 hover:bg-white/5 transition-colors">
                                <TableCell className="text-gray-400">{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell className="font-semibold">{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`px-4 py-1 rounded-full text-xs font-bold border-none shadow-sm ${appliedJob?.status === "rejected" ? 'bg-rose-500/20 text-rose-400' :
                                            appliedJob.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/20 text-emerald-400'
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