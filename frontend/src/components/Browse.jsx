import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import Job from './Job';
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
        <div className='min-h-screen bg-[#0F172A] text-white'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4'>
                <h1 className='font-extrabold text-3xl mb-10 flex items-center gap-3'>
                    Search Results
                    <Badge className='bg-indigo-500 text-white border-none px-3 py-1'>{allJobs.length}</Badge>
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
                    <div className='text-center py-20 bg-[#1E293B] rounded-3xl border border-gray-800 border-dashed'>
                        <p className='text-gray-500 text-xl'>No jobs found for your search.</p>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Browse