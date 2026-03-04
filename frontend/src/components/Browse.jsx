import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';

// const randomJobs = [1, 2,45];

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();
    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(""));
        }
    }, [])
    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4'>
                <h1 className='font-extrabold text-3xl mb-10 flex items-center gap-3 text-slate-900'>
                    Search Results
                    <Badge className='bg-indigo-600 text-white border-none px-3 py-1'>{allJobs.length}</Badge>
                </h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {
                        allJobs.map((job) => {
                            return (
                                <Job key={job._id} job={job} />
                            )
                        })
                    }
                </div>
                {allJobs.length === 0 && (
                    <div className='text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm'>
                        <p className='text-slate-400 text-xl font-medium'>No jobs found for your search.</p>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Browse