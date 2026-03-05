import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal, Trash2, ExternalLink } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import api from '@/lib/api'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setAllAdminJobs } from '@/redux/jobSlice'

const AdminJobsTable = () => {
    const { allAdminJobs, searchJobByText } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    const deleteJobHandler = async (jobId) => {
        try {
            const res = await api.delete(`${JOB_API_END_POINT}/delete/${jobId}`);
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
        const filteredJobs = allAdminJobs.filter((job) => {
            if (!searchJobByText) {
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name?.toLowerCase().includes(searchJobByText.toLowerCase());
        });
        setFilterJobs(filteredJobs);
    }, [allAdminJobs, searchJobByText])

    const isOwnJob = (job) => {
        const createdById = job?.created_by?._id || job?.created_by;
        return createdById === user?._id;
    };

    return (
        <div className='bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden'>
            <Table>
                <TableCaption className="text-slate-400 py-6 font-medium text-xs uppercase tracking-widest bg-slate-50/50 border-t border-slate-100">All jobs across the platform ({filterJobs?.length || 0})</TableCaption>
                <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Company</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Role</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Posted By</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Date Posted</TableHead>
                        <TableHead className="text-right text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => {
                            const own = isOwnJob(job);
                            return (
                                <TableRow key={job._id} className={`border-slate-50 hover:bg-slate-50/50 transition-all duration-300 group ${!own ? 'opacity-80' : ''}`}>
                                    <TableCell className="px-6 py-4">
                                        <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{job?.company?.name}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-slate-600 font-bold text-sm">{job?.title}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {own ? (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg">You</span>
                                        ) : (
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg">{job?.created_by?.fullname || 'Other'}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{job?.createdAt?.split("T")[0]}</span>
                                    </TableCell>
                                    <TableCell className="text-right px-6 py-4">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button
                                                onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl gap-2 transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Applicants
                                            </Button>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-48 bg-white/90 backdrop-blur-xl border-slate-100 text-slate-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 rounded-2xl" align="end">
                                                    <div className='flex flex-col gap-1'>
                                                        {own && (
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => navigate(`/admin/jobs/${job._id}`)}
                                                                className='flex items-center justify-start gap-3 w-full px-4 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group h-auto'
                                                            >
                                                                <Edit2 className='w-4 h-4 text-slate-400 group-hover:text-indigo-600' />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Edit Setup</span>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => navigate(`/description/${job._id}`)}
                                                            className='flex items-center justify-start gap-3 w-full px-4 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group h-auto'
                                                        >
                                                            <ExternalLink className='w-4 h-4 text-slate-400 group-hover:text-emerald-600' />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">View Public</span>
                                                        </Button>
                                                        {own && (
                                                            <>
                                                                <div className='h-px bg-slate-50 my-1 mx-2'></div>
                                                                <Button
                                                                    variant="ghost"
                                                                    onClick={() => deleteJobHandler(job._id)}
                                                                    className='flex items-center justify-start gap-3 w-full px-4 py-2.5 hover:bg-rose-50 rounded-xl cursor-pointer transition-all group h-auto'
                                                                >
                                                                    <Trash2 className='w-4 h-4 text-slate-400 group-hover:text-rose-600' />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 group-hover:text-rose-600">Delete Job</span>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable