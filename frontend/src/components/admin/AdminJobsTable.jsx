import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('called');
        const filteredJobs = allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText])
    return (
        <div>
            <Table className="bg-white">
                <TableCaption className="text-slate-400 py-4 font-medium">A list of your recent posted jobs</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Company Name</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Role</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                        <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => (
                            <TableRow key={job._id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                                <TableCell className="font-bold text-slate-900">{job?.company?.name}</TableCell>
                                <TableCell className="text-slate-700 font-medium">{job?.title}</TableCell>
                                <TableCell className="text-slate-500 text-sm">{job?.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                            variant="outline"
                                            size="sm"
                                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 font-bold gap-2 shadow-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Applicants
                                        </Button>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full">
                                                    <MoreHorizontal className="text-slate-400 h-5 w-5" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-40 bg-white border-slate-200 text-slate-900 shadow-xl p-1" align="end">
                                                <div onClick={() => navigate(`/admin/jobs/${job._id}`)} className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors'>
                                                    <Edit2 className='w-4 h-4 text-indigo-600' />
                                                    <span className="text-sm font-semibold">Edit Job</span>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
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

export default AdminJobsTable