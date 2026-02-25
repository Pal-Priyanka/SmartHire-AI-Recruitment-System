import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/description/${job._id}`)} className='p-6 rounded-xl shadow-2xl bg-[#1E293B] border border-gray-800 cursor-pointer hover:border-indigo-500/50 transition-all group'>
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className='font-semibold text-lg text-white group-hover:text-indigo-400 transition-colors'>{job?.company?.name}</h1>
                    <p className='text-sm text-gray-400'>India</p>
                </div>
                <Badge className='bg-indigo-500/10 text-indigo-400 border-none' variant="outline">New</Badge>
            </div>
            <div>
                <h1 className='font-bold text-xl my-3 text-white'>{job?.title}</h1>
                <p className='text-sm text-gray-400 line-clamp-2'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-6 flex-wrap'>
                <Badge className={'bg-blue-500/10 text-blue-400 border-none font-bold'} variant="outline">{job?.position} Positions</Badge>
                <Badge className={'bg-emerald-500/10 text-emerald-400 border-none font-bold'} variant="outline">{job?.jobType}</Badge>
                <Badge className={'bg-purple-500/10 text-purple-400 border-none font-bold'} variant="outline">{job?.salary}LPA</Badge>
            </div>
        </div>
    )
}

export default LatestJobCards