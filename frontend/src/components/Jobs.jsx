import React, { useEffect, useState } from 'react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// const jobsArray = [1, 2, 3, 4, 5, 6, 7, 8];

const Jobs = () => {
    const { allJobs, searchedQuery } = useSelector(store => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);

    useEffect(() => {
        if (searchedQuery) {
            const filteredJobs = allJobs.filter((job) => {
                return job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
                    job.location.toLowerCase().includes(searchedQuery.toLowerCase())
            })
            setFilterJobs(filteredJobs)
        } else {
            setFilterJobs(allJobs)
        }
    }, [allJobs, searchedQuery]);

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <div className='flex flex-col md:flex-row gap-8'>
                    <div className='md:w-1/4'>
                        <FilterCard />
                    </div>
                    {
                        filterJobs.length <= 0 ? (
                            <div className='flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed'>
                                <span className='text-slate-500 text-xl font-medium'>No matching opportunities found</span>
                                <p className='text-slate-600 mt-2'>Try adjusting your filters to find more roles.</p>
                            </div>
                        ) : (
                            <div className='flex-1 h-[88vh] overflow-y-auto pb-5 custom-scrollbar'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
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