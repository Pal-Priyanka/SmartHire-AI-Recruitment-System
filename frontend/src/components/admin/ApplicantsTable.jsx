import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';

const shortlistingStatus = ["Accepted", "Rejected"];

const ApplicantsTable = ({ isGlobal = false }) => {
    const { applicants } = useSelector(store => store.application);

    const statusHandler = async (status, id) => {
        console.log('called');
        try {
            axios.defaults.withCredentials = true;
            const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
            console.log(res);
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    return (
        <div>
            <Table className="bg-white">
                <TableCaption className="text-slate-400 py-4 font-medium">A list of recently applied candidates</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">FullName</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Email</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Contact</TableHead>
                        {isGlobal && <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Applied For</TableHead>}
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Resume</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">AI Score</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                        <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        applicants && applicants?.applications?.map((item) => (
                            <TableRow key={item._id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                                <TableCell className="font-bold text-slate-900">{item?.applicant?.fullname}</TableCell>
                                <TableCell className="text-slate-600 text-sm font-medium">{item?.applicant?.email}</TableCell>
                                <TableCell className="text-slate-600 text-sm font-medium">{item?.applicant?.phoneNumber}</TableCell>
                                {isGlobal && (
                                    <TableCell className="text-slate-900 font-semibold">{item?.job?.title || "N/A"}</TableCell>
                                )}
                                <TableCell>
                                    {
                                        item.applicant?.profile?.resume ? <a className="text-indigo-600 hover:text-indigo-800 transition-colors font-bold underline underline-offset-4 decoration-indigo-200" href={item?.applicant?.profile?.resume} target="_blank" rel="noopener noreferrer">{item?.applicant?.profile?.resumeOriginalName}</a> : <span className="text-slate-400 italic">NA</span>
                                    }
                                </TableCell>
                                <TableCell>
                                    <Badge className={`px-4 py-1 rounded-xl text-xs font-black shadow-md border-none ${item.aiScore >= 70 ? 'bg-emerald-100 text-emerald-700' : item.aiScore >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {item.aiScore || 0}% Match
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {item?.applicant?.createdAt ? item.applicant.createdAt.split("T")[0] : "Recently"}
                                </TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger>
                                            <MoreHorizontal className="text-slate-400 hover:text-slate-900" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 bg-white border-slate-200 text-slate-900 shadow-xl p-1">
                                            {
                                                shortlistingStatus.map((status, index) => {
                                                    return (
                                                        <div onClick={() => statusHandler(status, item?._id)} key={index} className='flex items-center gap-3 w-full px-3 py-2.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors mt-0.5'>
                                                            <span className={`text-sm font-semibold ${status === 'Accepted' ? 'text-emerald-600' : 'text-rose-600'}`}>{status}</span>
                                                        </div>
                                                    )
                                                })
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