import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { JOB_API_END_POINT } from '@/utils/constant';
import { setRecommendedJobs } from '@/redux/jobSlice';
import { toast } from 'sonner';
import { Button } from './ui/button';

// const jobsArray = [1, 2, 3, 4, 5, 6, 7, 8];

const Jobs = () => {
    const dispatch = useDispatch();
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [isRanking, setIsRanking] = useState(false);
    const [useAiRank, setUseAiRank] = useState(false);

    const handleAiRank = async () => {
        if (!user?.profile?.resume) {
            toast.error("Please upload your resume first!");
            return;
        }

        try {
            setIsRanking(true);
            const res = await api.get(`${JOB_API_END_POINT}/recommendations`);
            if (res.data.success) {
                dispatch(setRecommendedJobs(res.data.jobs));
                setUseAiRank(true);
                toast.success("Feed personalized by AI!");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to rank jobs");
        } finally {
            setIsRanking(false);
        }
    };

    useEffect(() => {
        if (searchedQuery && allJobs) {
            const filteredJobs = allJobs.filter((job) => {
                return (job?.title?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job?.description?.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job?.location?.toLowerCase().includes(searchedQuery.toLowerCase()))
            })
            setFilterJobs(filteredJobs)
        } else {
            setFilterJobs(allJobs || [])
        }
    }, [allJobs, searchedQuery]);

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <div className='flex items-center justify-between mb-10'>
                    <h1 className='text-3xl font-black text-slate-900 tracking-tight'>Available Roles</h1>
                    {user?.role === 'candidate' && (
                        <Button
                            onClick={handleAiRank}
                            disabled={isRanking}
                            className={`rounded-2xl h-12 px-8 font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95 flex items-center gap-3 ${useAiRank ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-white text-slate-900 border border-slate-200 hover:border-indigo-600 shadow-slate-100'}`}
                        >
                            <Sparkles className={`h-4 w-4 ${isRanking ? 'animate-spin' : ''}`} />
                            {isRanking ? "Ranking..." : useAiRank ? "AI Match Active" : "Rank by AI Match"}
                        </Button>
                    )}
                </div>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='md:w-1/4'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? (
                            <div className='flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed'>
                                <span className='text-slate-500 text-xl font-medium'>Nothing here yet — let's broaden the horizon.</span>
                                <p className='text-slate-600 mt-2'>Try adjusting your filters to surface more roles.</p>
                            </div>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5 custom-scrollbar'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'>
                                    {
                                        filterJobs.map((job) => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                                key={job?._id}>
                                                <Job job={job} />
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Jobs