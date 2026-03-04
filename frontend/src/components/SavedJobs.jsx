import React from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'

const SavedJobs = () => {
    const { allJobs } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);

    const savedJobs = allJobs.filter(job => user?.profile?.bookmarks?.includes(job._id));

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4'>
                <div className='flex items-center gap-4 mb-12'>
                    <div className='h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200'>
                        <Bookmark className='h-6 w-6 text-white' />
                    </div>
                    <div>
                        <h1 className='font-black text-4xl tracking-tighter uppercase'>Saved Opportunities</h1>
                        <p className='text-slate-500 font-medium'>Jobs you've bookmarked for later review</p>
                    </div>
                </div>

                {
                    savedJobs.length <= 0 ? (
                        <div className='flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 premium-shadow text-center px-6'>
                            <div className='h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-8'>
                                <Bookmark className='h-10 w-10 text-slate-300' />
                            </div>
                            <h2 className='text-2xl font-black text-slate-900 mb-2'>No Saved Jobs Yet</h2>
                            <p className='text-slate-500 max-w-sm mx-auto font-medium'>Start exploring jobs and bookmark the ones that catch your eye!</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8'>
                            {
                                savedJobs.map((job) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        key={job?._id}>
                                        <Job job={job} />
                                    </motion.div>
                                ))
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default SavedJobs
