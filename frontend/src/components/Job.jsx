import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const Job = ({ job }) => {
    const navigate = useNavigate();
    // const jobId = "lsekdhjgdsnfvsdkjf";

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div className='p-6 rounded-2xl shadow-2xl bg-[#1E293B] border border-gray-800 hover:border-indigo-500/50 transition-all group'>
            <div className='flex items-center justify-between mb-4'>
                <p className='text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Posted Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                <Button variant="ghost" className="rounded-full h-8 w-8 p-0 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10" size="icon">
                    <Bookmark className='h-4 w-4' />
                </Button>
            </div>

            <div className='flex items-center gap-4 mb-4'>
                <div className='h-12 w-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0 border border-gray-700'>
                    <Avatar className="h-full w-full rounded-none">
                        <AvatarImage src={job?.company?.logo} className="object-contain" />
                    </Avatar>
                </div>
                <div>
                    <h1 className='font-bold text-lg text-white group-hover:text-indigo-400 transition-colors leading-tight'>{job?.company?.name}</h1>
                    <p className='text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5'>India</p>
                </div>
            </div>

            <div className='mb-6'>
                <h1 className='font-extrabold text-xl mb-2 text-white'>{job?.title}</h1>
                <p className='text-sm text-gray-400 line-clamp-2 leading-relaxed'>{job?.description}</p>
            </div>

            <div className='flex flex-wrap items-center gap-2 mb-6'>
                <Badge className='bg-blue-500/10 text-blue-400 border-none font-bold px-3 py-1 text-[10px]' variant="outline">{job?.position} Positions</Badge>
                <Badge className='bg-rose-500/10 text-rose-400 border-none font-bold px-3 py-1 text-[10px]' variant="outline">{job?.jobType}</Badge>
                <Badge className='bg-emerald-500/10 text-emerald-400 border-none font-bold px-3 py-1 text-[10px]' variant="outline">{job?.salary}LPA</Badge>
            </div>

            <div className='flex items-center gap-3 pt-4 border-t border-gray-800'>
                <Button
                    onClick={() => navigate(`/description/${job?._id}`)}
                    variant="outline"
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl h-11 transition-all"
                >
                    View Details
                </Button>
                <Button className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl h-11 transition-all shadow-lg shadow-indigo-500/20">
                    Save for Later
                </Button>
            </div>
        </div>
    )
}

export default Job