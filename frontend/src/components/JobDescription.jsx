import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import Navbar from './shared/Navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from './ui/button'
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import api from '@/lib/api';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { User, Loader2, Sparkles, XCircle, Clock, CheckCircle2, Search, Calendar, MessageSquare, Briefcase, Award, TrendingUp, Wand2, GraduationCap } from 'lucide-react';
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

    const navigate = useNavigate();
    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        // Validation: Resume must be present
        if (!user?.profile?.resume) {
            toast.error("Hold on — upload your resume first. We need something to work with.");
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
            toast.error(error.response?.data?.message || "Something didn't go as planned. Try again?");
        } finally {
            setIsAnalyzing(false);
        }
    }

    const withdrawJobHandler = async (reason = "Other") => {
        try {
            setIsWithdrawing(true);
            const res = await api.delete(`${APPLICATION_API_END_POINT}/withdraw/${jobId}`, { data: { reason } });

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
            toast.error(error.response?.data?.message || "Couldn't pull the plug — try again.");
        } finally {
            setIsWithdrawing(false);
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                // Clear the previous job to prevent flicker of stale data (important for redux-persist)
                dispatch(setSingleJob(null));

                const res = await api.get(`${JOB_API_END_POINT}/get/${jobId}`);
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                } else {
                    toast.error(res.data.message || "Could not find that opening.");
                }
            } catch (error) {
                console.log(error);
                toast.error("The data pipeline hit a snag. Try refreshing?");
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

    // Find the user's application for the journey timeline
    const userApplication = singleJob?.applications?.find(app => (app.applicant?._id || app.applicant) === user?._id);

    const getStatusConfig = (status) => {
        const configs = {
            'applied': { color: 'text-blue-500', bg: 'bg-blue-50', icon: <CheckCircle2 className="h-4 w-4" />, label: 'Applied' },
            'screening': { color: 'text-purple-500', bg: 'bg-purple-50', icon: <Search className="h-4 w-4" />, label: 'Screening' },
            'screened': { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: <Award className="h-4 w-4" />, label: 'Screened' },
            'interview scheduled': { color: 'text-amber-500', bg: 'bg-amber-50', icon: <Calendar className="h-4 w-4" />, label: 'Interview Fixed' },
            'interviewed': { color: 'text-orange-500', bg: 'bg-orange-50', icon: <MessageSquare className="h-4 w-4" />, label: 'Interviewed' },
            'offer extended': { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <Briefcase className="h-4 w-4" />, label: 'Offer Out' },
            'offer accepted': { color: 'text-green-600', bg: 'bg-green-50', icon: <Sparkles className="h-4 w-4" />, label: 'Joined' },
            'rejected': { color: 'text-rose-500', bg: 'bg-rose-50', icon: <XCircle className="h-4 w-4" />, label: 'Declined' },
        };
        const s = status?.toLowerCase() || 'applied';
        return configs[s] || { color: 'text-slate-400', bg: 'bg-slate-50', icon: <Clock className="h-4 w-4" />, label: status || 'Pending' };
    };

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-500'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 bg-white p-12 rounded-[3.5rem] border border-slate-100 premium-shadow relative overflow-hidden group'>
                    <div className='absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mt-32 transition-transform duration-700 group-hover:scale-110'></div>

                    <div className='relative z-10 space-y-6'>
                        <h1 className='font-black text-4xl md:text-6xl text-slate-900 tracking-tighter leading-[1.1]'>
                            {singleJob?._id === jobId || singleJob?._id?.toString() === jobId ? singleJob?.title : "Loading brilliance..."}
                        </h1>
                        <div className='flex flex-wrap items-center gap-3 mt-4'>
                            <div className='px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>
                                {singleJob?._id === jobId || singleJob?._id?.toString() === jobId ? `${singleJob?.position} Slots Open` : '...'}
                            </div>
                            <div className='px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>
                                {singleJob?._id === jobId || singleJob?._id?.toString() === jobId ? singleJob?.jobType : '...'}
                            </div>
                            <div className='px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest'>
                                {singleJob?._id === jobId || singleJob?._id?.toString() === jobId ? `${singleJob?.salary} LPA` : '...'}
                            </div>
                        </div>
                    </div>
                    {
                        user?.role !== 'recruiter' && (
                            <div className='flex flex-wrap items-center gap-4 relative z-10'>
                                {isApplied ? (
                                    <>
                                        {['accepted', 'interview scheduled', 'interviewed', 'offer extended', 'offer accepted'].includes(userApplication?.status?.toLowerCase()) && (
                                            <Button
                                                onClick={() => navigate(`/application/${userApplication?._id}/prep-kit`)}
                                                className="h-20 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all flex items-center gap-3 uppercase tracking-widest text-[10px]"
                                            >
                                                <GraduationCap className="h-6 w-6" />
                                                Interview Prep Kit
                                            </Button>
                                        )}
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    disabled={isWithdrawing}
                                                    className="h-20 px-8 text-[10px] font-black rounded-2xl bg-white text-rose-600 border-2 border-rose-50 hover:bg-rose-50 shadow-lg shadow-rose-100/50 transition-all duration-300 active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                                                >
                                                    {isWithdrawing ? (
                                                        <>
                                                            <Loader2 className='animate-spin h-5 w-5' />
                                                            Withdrawing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className='h-5 w-5' />
                                                            Withdraw Application
                                                        </>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 bg-white p-6 rounded-[2rem] border-slate-100 shadow-2xl" align="end">
                                                <h4 className='text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4'>Why are you withdrawing?</h4>
                                                <div className='flex flex-col gap-2'>
                                                    {['Salary/Benefits', 'Location/Commute', 'Process Speed', 'Offer from elsewhere', 'Changed mind', 'Other'].map((reason) => (
                                                        <Button
                                                            key={reason}
                                                            variant="ghost"
                                                            onClick={() => withdrawJobHandler(reason)}
                                                            className="justify-start text-[10px] font-black uppercase tracking-widest p-3 h-auto hover:bg-rose-50 hover:text-rose-600 rounded-xl"
                                                        >
                                                            {reason}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => navigate(`/description/${jobId}/optimize`)}
                                            className="h-20 px-8 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-black rounded-2xl shadow-xl shadow-indigo-50 transition-all flex items-center gap-3 uppercase tracking-widest text-[10px]"
                                        >
                                            <Wand2 className="h-6 w-6" />
                                            Optimize Resume
                                        </Button>
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
                                                    <span className='animate-pulse'>Analyzing...</span>
                                                </div>
                                            ) : (
                                                <div className='flex items-center gap-3'>
                                                    <Sparkles className='h-6 w-6 group-hover/apply:animate-bounce' />
                                                    Apply Now
                                                </div>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )
                    }
                </div>

                {
                    user && user.role === 'candidate' && isApplied && userApplication && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='mb-12 bg-white border border-indigo-100 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden'
                        >
                            <div className='absolute top-0 right-0 w-48 h-48 bg-indigo-50/30 rounded-full blur-3xl -mr-24 -mt-24'></div>

                            <div className='relative z-10'>
                                <div className='flex items-center gap-4 mb-10'>
                                    <div className='h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100'>
                                        <TrendingUp className='h-5 w-5 text-white' />
                                    </div>
                                    <div>
                                        <h3 className='font-black text-xl text-slate-900 tracking-tight'>Application Journey</h3>
                                        <p className='text-slate-400 font-medium text-[10px] uppercase tracking-widest'>Tracking your trajectory</p>
                                    </div>
                                    <div className='ml-auto'>
                                        <Badge className={`${getStatusConfig(userApplication.status).bg} ${getStatusConfig(userApplication.status).color} border-none font-black text-[9px] tracking-[0.1em] px-3 py-1.5 rounded-lg uppercase`}>
                                            Current: {userApplication.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className='relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-0 px-4'>
                                    {/* Line for Desktop */}
                                    <div className='hidden md:block absolute top-[1.25rem] left-8 right-8 h-1 bg-slate-100 rounded-full -z-0'>
                                        <motion.div
                                            className='h-full bg-indigo-500 rounded-full'
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </div>

                                    {(userApplication.statusHistory?.length > 0 ? userApplication.statusHistory : [{ status: 'applied', timestamp: userApplication.createdAt }]).map((event, idx) => {
                                        const config = getStatusConfig(event.status);
                                        return (
                                            <div key={idx} className='relative z-10 flex md:flex-col items-center gap-4 md:gap-3 group'>
                                                <div className={`h-10 w-10 ${config.bg} ${config.color} rounded-full flex items-center justify-center border-4 border-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                                                    {config.icon}
                                                </div>
                                                <div className='text-left md:text-center'>
                                                    <p className='font-black text-[10px] text-slate-900 uppercase tracking-wider mb-0.5'>{config.label}</p>
                                                    <p className='text-[9px] font-bold text-slate-400'>
                                                        {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Future Steps (Visual Placeholder) */}
                                    {!(userApplication.status?.toLowerCase() === 'rejected' || userApplication.status?.toLowerCase() === 'offer accepted') && (
                                        <div className='relative z-10 flex md:flex-col items-center gap-4 md:gap-3 opacity-40 grayscale'>
                                            <div className='h-10 w-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center border-4 border-white'>
                                                <Clock className='h-4 w-4' />
                                            </div>
                                            <div className='text-left md:text-center'>
                                                <p className='font-black text-[10px] text-slate-400 uppercase tracking-wider mb-0.5'>Next Stage</p>
                                                <p className='text-[9px] font-bold text-slate-300'>Pending</p>
                                            </div>
                                        </div>
                                    )}
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
                                The Blueprint
                            </h2>
                            <p className='text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium'>
                                {singleJob?.description || "No description provided — yet."}
                            </p>
                        </div>

                        <div className='bg-white p-12 rounded-[3rem] border border-slate-100 premium-shadow'>
                            <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-emerald-500 rounded-full animate-pulse'></span>
                                The Essentials
                            </h2>
                            <div className='flex flex-wrap gap-3'>
                                {
                                    singleJob?.requirements?.length > 0 ? (
                                        singleJob.requirements.map((skill, index) => (
                                            <Badge key={index} className='bg-white text-slate-600 border border-slate-100 font-black uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm'>{skill}</Badge>
                                        ))
                                    ) : (
                                        <p className='text-slate-400 font-medium italic'>No specific requirements listed — that's unusually open-ended.</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl'>
                            <h2 className='text-xl font-black text-slate-900 mb-8 uppercase tracking-widest text-[12px]'>At a Glance</h2>
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
                            <p className='text-indigo-100 text-xs mb-2 uppercase font-black tracking-[0.2em]'>Candidates in the Running</p>
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