import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector, useDispatch } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const JobSetup = () => {
    const params = useParams();
    const jobId = params.id;
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: "",
        applyBy: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => company.name.toLowerCase() === value);
        setInput({ ...input, companyId: selectedCompany?._id });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.put(`${JOB_API_END_POINT}/update/${jobId}`, input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update job");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    const job = res.data.job;
                    setInput({
                        title: job.title || "",
                        description: job.description || "",
                        requirements: job.requirements?.join(",") || "",
                        salary: job.salary || "",
                        location: job.location || "",
                        jobType: job.jobType || "",
                        experience: job.experienceLevel || "",
                        position: job.position || 0,
                        companyId: job.company?._id || job.company || "",
                        applyBy: job.applyBy ? new Date(job.applyBy).toISOString().slice(0, 16) : ""
                    });
                }
            } catch (error) {
                console.log(error);
                toast.error("Failed to fetch job details");
            }
        }
        fetchJobDetails();
    }, [jobId]);

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='flex items-center justify-center py-12 px-4'>
                <form onSubmit={submitHandler} className='p-10 max-w-4xl w-full bg-white border border-slate-100 shadow-2xl rounded-[2.5rem]'>
                    <div className='flex items-center gap-5 mb-10'>
                        <Button onClick={() => navigate("/admin/jobs")} variant="outline" className="flex items-center gap-2 text-slate-500 font-bold border-slate-200 rounded-xl hover:bg-slate-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            Back
                        </Button>
                        <h1 className='font-black text-3xl text-slate-900 tracking-tight'>Edit <span className='text-indigo-600'>Job Details</span></h1>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Salary (LPA)</Label>
                            <Input
                                type="text"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={input.jobType}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Experience Level (Years)</Label>
                            <Input
                                type="text"
                                name="experience"
                                value={input.experience}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>No of Openings</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Apply By (Deadline)</Label>
                            <Input
                                type="datetime-local"
                                name="applyBy"
                                value={input.applyBy}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 h-12"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <div className='md:col-span-2 mt-4'>
                                    <Label className='text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4'>Select Company</Label>
                                    <Select
                                        onValueChange={selectChangeHandler}
                                        value={companies.find(c => c._id === input.companyId)?.name?.toLowerCase()}
                                    >
                                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 rounded-xl h-12">
                                            <SelectValue placeholder="Select a Company" />
                                        </SelectTrigger>
                                        <SelectContent className='bg-white border-slate-200'>
                                            <SelectGroup>
                                                {
                                                    companies.map((company) => {
                                                        return (
                                                            <SelectItem key={company._id} value={company?.name?.toLowerCase()} className='hover:bg-slate-50 cursor-pointer'>{company.name}</SelectItem>
                                                        )
                                                    })
                                                }

                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )
                        }
                    </div>
                    {
                        loading ? (
                            <Button className="w-full mt-10 bg-indigo-600 h-14 rounded-2xl">
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                Updating Job...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg h-14 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                                Update Job Details
                            </Button>
                        )
                    }
                </form>
            </div>
        </div>
    )
}

export default JobSetup
