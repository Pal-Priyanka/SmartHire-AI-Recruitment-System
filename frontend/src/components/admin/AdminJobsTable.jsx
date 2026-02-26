import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const dispatch = useDispatch();

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    const deleteJobHandler = async (jobId) => {
        try {
            const res = await axios.delete(`${JOB_API_END_POINT}/delete/${jobId}`, {
                withCredentials: true
            });
            if (res.data.success) {
                const updatedJobs = allAdminJobs.filter((job) => job._id !== jobId);
                dispatch(setAllAdminJobs(updatedJobs));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete job");
        }
    }

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
                                            <PopoverContent className="w-44 bg-white border-slate-200 text-slate-900 shadow-xl p-2 rounded-xl" align="end">
                                                <div className='flex flex-col gap-1'>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => navigate(`/admin/jobs/${job._id}`)}
                                                        className='flex items-center justify-start gap-3 w-full px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group h-auto'
                                                    >
                                                        <Edit2 className='w-4 h-4 text-slate-400 group-hover:text-indigo-600' />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Edit Details</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => navigate(`/description/${job._id}`)}
                                                        className='flex items-center justify-start gap-3 w-full px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group h-auto'
                                                    >
                                                        <ExternalLink className='w-4 h-4 text-slate-400 group-hover:text-emerald-600' />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">View Details</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => deleteJobHandler(job._id)}
                                                        className='flex items-center justify-start gap-3 w-full px-3 py-2 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors group h-auto'
                                                    >
                                                        <Trash2 className='w-4 h-4 text-slate-400 group-hover:text-rose-600' />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600">Delete</span>
                                                    </Button>
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