import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import Navbar from './shared/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import api from '@/lib/api';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { User, Loader2, Sparkles, XCircle } from 'lucide-react';
import SmartHireAdvisor from './SmartHireAdvisor';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [matchInsights, setMatchInsights] = useState(null);
    const [loadingMatch, setLoadingMatch] = useState(false);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        // Validation: Resume must be present
        if (!user?.profile?.resume) {
            toast.error("Resume Required: Please upload your resume in the profile section before applying.");
            return;
        }

        try {
            setIsAnalyzing(true);

            // Simulating AI SmartHire Analysis
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await api.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`);

            if (res.data.success) {
                setIsApplied(true); // Update the local state
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Something went wrong during application.");
        } finally {
            setIsAnalyzing(false);
        }
    }

    const withdrawJobHandler = async () => {
        try {
            setIsWithdrawing(true);
            const res = await api.delete(`${APPLICATION_API_END_POINT}/withdraw/${jobId}`);

            if (res.data.success) {
                setIsApplied(false);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: singleJob.applications.filter(app => app.applicant !== user?._id)
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to withdraw application.");
        } finally {
            setIsWithdrawing(false);
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await api.get(`${JOB_API_END_POINT}/get/${jobId}`);
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    useEffect(() => {
        const fetchMatchAnalysis = async () => {
            if (user?.role === 'candidate' && user?.profile?.resume && !isApplied) {
                try {
                    setLoadingMatch(true);
                    const res = await api.get(`${JOB_API_END_POINT}/match/${jobId}`);
                    if (res.data.success) {
                        setMatchInsights(res.data.insights);
                    }
                } catch (error) {
                    console.log("Match analysis failed:", error);
                } finally {
                    setLoadingMatch(false);
                }
            }
        };
        fetchMatchAnalysis();
    }, [jobId, user?.profile?.resume, isApplied]);

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-500'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 bg-white p-12 rounded-[3.5rem] border border-slate-100 premium-shadow relative overflow-hidden group'>
                    <div className='absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mt-32 transition-transform duration-700 group-hover:scale-110'></div>

                    <div className='relative z-10 space-y-6'>
                        <h1 className='font-black text-4xl md:text-6xl text-slate-900 tracking-tighter leading-[1.1]'>{singleJob?.title}</h1>
                        <div className='flex flex-wrap items-center gap-3 mt-4'>
                            <div className='px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>{singleJob?.position} Slots Open</div>
                            <div className='px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>{singleJob?.jobType}</div>
                            <div className='px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>{singleJob?.salary} LPA</div>
                        </div>
                    </div>
                    {
                        user?.role !== 'recruiter' && (
                            <div className='flex items-center gap-4 relative z-10'>
                                {isApplied ? (
                                    <Button
                                        onClick={withdrawJobHandler}
                                        disabled={isWithdrawing}
                                        className="h-20 px-12 text-lg font-black rounded-2xl bg-white text-rose-600 border-2 border-rose-50 hover:bg-rose-50 shadow-lg shadow-rose-100/50 transition-all duration-300 active:scale-95 flex items-center gap-3"
                                    >
                                        {isWithdrawing ? (
                                            <>
                                                <Loader2 className='animate-spin h-5 w-5' />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className='h-5 w-5' />
                                                Withdraw Application
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={applyJobHandler}
                                        disabled={isAnalyzing}
                                        className={`h-20 px-12 text-lg font-black rounded-2xl transition-all duration-500 overflow-hidden group/apply ${isAnalyzing
                                            ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed border border-indigo-100'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(79,70,229,0.4)] hover:-translate-y-1 active:scale-95'
                                            }`}
                                    >
                                        {isAnalyzing ? (
                                            <div className='flex items-center gap-3'>
                                                <Loader2 className='animate-spin h-6 w-6' />
                                                <span className='animate-pulse'>AI Analyzing Profile...</span>
                                            </div>
                                        ) : (
                                            <div className='flex items-center gap-3'>
                                                <Sparkles className='h-6 w-6 group-hover/apply:animate-bounce' />
                                                Execute Application
                                            </div>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )
                    }
                </div>

                {
                    user && user.role === 'candidate' && matchInsights && !isApplied && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='mb-12 bg-white/80 backdrop-blur-md border border-indigo-100 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)]'
                        >
                            <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
                                <div className='flex items-center gap-6'>
                                    <div className='h-16 w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0'>
                                        <Sparkles className='h-8 w-8 text-white' />
                                    </div>
                                    <div className='space-y-1'>
                                        <h3 className='font-black text-xl text-slate-900 tracking-tight flex items-center gap-2'>
                                            AI Match Analysis
                                            <Badge className='bg-indigo-50 text-indigo-600 border-none text-[9px] font-black tracking-widest px-2 py-0.5'>BETA</Badge>
                                        </h3>
                                        <p className='text-slate-500 font-medium text-sm'>
                                            Your profile matches <span className='text-indigo-600 font-bold'>{matchInsights.matchingSkills?.length || 0}</span> of <span className='text-slate-900 font-bold'>{singleJob?.requirements?.length || 0}</span> required skills.
                                        </p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-8 w-full md:w-auto bg-slate-50/50 p-6 rounded-3xl border border-slate-100'>
                                    <div className='flex flex-col items-center md:items-start min-w-[100px]'>
                                        <span className='text-2xl font-black text-slate-900'>{matchInsights.score}%</span>
                                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Compatibility</span>
                                    </div>
                                    <div className='hidden sm:block h-10 w-px bg-slate-200'></div>
                                    <div className='flex-1 md:flex-initial'>
                                        <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Missing Competencies</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {matchInsights.missingSkills?.length > 0 ? (
                                                matchInsights.missingSkills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className='px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-wider'>
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className='text-emerald-500 text-[10px] font-black uppercase tracking-widest'>All Core Skills Present</span>
                                            )}
                                            {matchInsights.missingSkills?.length > 3 && (
                                                <span className='text-slate-400 text-[10px] font-bold'>+{matchInsights.missingSkills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {
                    user && user.role === 'candidate' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className='mb-16'
                        >
                            <SmartHireAdvisor jobId={jobId} />
                        </motion.div>
                    )
                }

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
                    <div className='lg:col-span-2 space-y-12'>
                        <div className='bg-white p-12 rounded-[3rem] border border-slate-100 premium-shadow'>
                            <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-indigo-600 rounded-full animate-pulse'></span>
                                Detailed Specification
                            </h2>
                            <p className='text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium'>
                                {singleJob?.description || "No detailed description provided."}
                            </p>
                        </div>

                        <div className='bg-white p-12 rounded-[3rem] border border-slate-100 premium-shadow'>
                            <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-emerald-500 rounded-full animate-pulse'></span>
                                Technical Competencies
                            </h2>
                            <div className='flex flex-wrap gap-3'>
                                {
                                    singleJob?.requirements?.length > 0 ? (
                                        singleJob.requirements.map((skill, index) => (
                                            <Badge key={index} className='bg-white text-slate-600 border border-slate-100 font-black uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm'>{skill}</Badge>
                                        ))
                                    ) : (
                                        <p className='text-slate-400 font-medium italic'>No specific competencies listed.</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl'>
                            <h2 className='text-xl font-black text-slate-900 mb-8 uppercase tracking-widest text-[12px]'>Job Overview</h2>
                            <div className='space-y-8'>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-indigo-50 rounded-[1rem] text-indigo-600'><User className='h-6 w-6' /></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Role</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.title}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-emerald-50 rounded-[1rem] text-emerald-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>@</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Location</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.location}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-amber-50 rounded-[1rem] text-amber-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>Exp</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Experience</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.experienceLevel} Years</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-purple-50 rounded-[1rem] text-purple-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>$$</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Annual Salary</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.salary} LPA</p>
                                    </div>
                                </div>
                                {singleJob?.applyBy && (
                                    <div className='flex items-start gap-5'>
                                        <div className='p-3 bg-rose-50 rounded-[1rem] text-rose-600'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Apply By</p>
                                            <p className='text-slate-900 font-bold text-lg'>{new Date(singleJob.applyBy).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-center text-white'>
                            <p className='text-indigo-100 text-xs mb-2 uppercase font-black tracking-[0.2em]'>Applications Received</p>
                            <span className='text-5xl font-black'>{singleJob?.applications?.length || 0}</span>
                            <div className='h-px bg-indigo-500/30 my-6'></div>
                            <p className='text-indigo-100 text-[10px] font-bold uppercase tracking-wider'>Posted on {singleJob?.createdAt?.split("T")[0]}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDescription