import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/description/${job._id}`)} className='p-6 rounded-xl shadow-lg bg-white border border-slate-200 cursor-pointer hover:border-indigo-500 hover:shadow-indigo-500/10 transition-all group'>
            <div className='flex justify-between items-start'>
                <div>
                    <h1 className='font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors'>{job?.company?.name}</h1>
                    <p className='text-sm text-slate-500'>India</p>
                </div>
                <Badge className='bg-indigo-50 text-indigo-600 border-none' variant="outline">New</Badge>
            </div>
            <div>
                <h1 className='font-extrabold text-xl my-3 text-slate-900'>{job?.title}</h1>
                <p className='text-sm text-slate-500 line-clamp-2 leading-relaxed'>{job?.description}</p>
            </div>
            <div className='flex items-center gap-2 mt-6 flex-wrap'>
                <Badge className={'bg-blue-50 text-blue-600 border-none font-bold text-[10px]'} variant="outline">{job?.position} Positions</Badge>
                <Badge className={'bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]'} variant="outline">{job?.jobType}</Badge>
                <Badge className={'bg-purple-50 text-purple-600 border-none font-bold text-[10px]'} variant="outline">{job?.salary}LPA</Badge>
            </div>
        </div>
    )
}

export default LatestJobCards