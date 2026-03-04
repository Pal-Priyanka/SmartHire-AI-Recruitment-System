import React from 'react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({ job }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/description/${job._id}`)} className='flex flex-col h-full p-8 rounded-[2.5rem] bg-white border border-slate-100 cursor-pointer hover:border-indigo-200 hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.15)] transition-all duration-700 group relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-100/50 transition-colors'></div>

            <div className='relative z-10'>
                <div className='flex justify-between items-start mb-6'>
                    <div>
                        <h2 className='text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1'>{job?.company?.name}</h2>
                        <div className='flex items-center gap-1.5'>
                            <span className='h-1 w-1 rounded-full bg-slate-400'></span>
                            <p className='text-xs text-slate-500 font-bold uppercase tracking-widest'>India</p>
                        </div>
                    </div>
                    <Badge className='bg-slate-900 text-white border-none rounded-full px-4 font-black uppercase tracking-[0.1em] text-[9px] h-6' variant="outline">Hot Role</Badge>
                </div>

                <div className='mb-6'>
                    <h1 className='font-black text-2xl my-3 text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight line-clamp-1 h-[1.2em]'>{job?.title}</h1>
                    <p className='text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 opacity-80 h-[3em]'>{job?.description}</p>
                </div>

                <div className='flex items-center gap-2 mt-auto flex-wrap'>
                    <div className='text-[10px] font-black text-slate-900 py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100 whitespace-nowrap'>{job?.position} roles</div>
                    <div className='text-[10px] font-black text-indigo-600 py-1.5 px-3 bg-indigo-50 rounded-lg border border-indigo-100 whitespace-nowrap'>{job?.jobType}</div>
                    <div className='text-[10px] font-black text-emerald-600 py-1.5 px-3 bg-emerald-50 rounded-lg border border-emerald-100 whitespace-nowrap'>{job?.salary}LPA</div>
                </div>
            </div>
        </div>
    )
}

export default LatestJobCards