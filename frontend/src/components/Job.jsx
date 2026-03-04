import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const Job = ({ job }) => {
    const navigate = useNavigate();
    // const jobId = "lsekdhjgdsnfvsdkjf";

    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const isBookmarked = user?.profile?.bookmarks?.includes(job?._id);

    const bookmarkHandler = async () => {
        try {
            const res = await api.post(`${USER_API_END_POINT}/bookmark/${job?._id}`, {});
            if (res.data.success) {
                // Update local user state with new bookmarks
                const updatedUser = {
                    ...user,
                    profile: {
                        ...user.profile,
                        bookmarks: res.data.bookmarks
                    }
                };
                dispatch(setUser(updatedUser));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Internal server error");
        }
    }

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
    }

    return (
        <div
            onClick={() => navigate(`/description/${job?._id}`)}
            className='flex flex-col h-full p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 group relative overflow-hidden cursor-pointer'
        >
            <div className='absolute top-0 left-0 w-1 h-full bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity'></div>

            <div className='flex items-center justify-between mb-8'>
                <p className='text-[10px] font-black px-4 py-1.5 bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-full uppercase tracking-[0.1em] transition-colors'>
                    {daysAgoFunction(job?.createdAt) === 0 ? "Posted Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
                </p>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        bookmarkHandler();
                    }}
                    variant="ghost"
                    className={`rounded-full h-10 w-10 p-0 transition-all ${isBookmarked ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                    size="icon"
                >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
            </div>

            <div className='mb-6'>
                <div className='flex flex-col gap-1 mb-4'>
                    <h2 className='text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 truncate'>{job?.company?.name}</h2>
                    <h1 className='font-black text-2xl text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight line-clamp-1 h-[2em] flex items-center'>{job?.title}</h1>
                </div>
                <p className='text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 opacity-80 h-[3em]'>{job?.description}</p>
            </div>

            <div className='flex flex-wrap items-center gap-2 mb-6'>
                <div className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 rounded-lg'>
                    <span className='h-1.5 w-1.5 rounded-full bg-blue-400'></span>
                    <span className='text-[9px] font-black uppercase tracking-wider text-blue-700 whitespace-nowrap'>{job?.position} Roles</span>
                </div>
                <div className='flex items-center gap-1.5 px-3 py-1.5 bg-rose-50/50 rounded-lg'>
                    <span className='h-1.5 w-1.5 rounded-full bg-rose-400'></span>
                    <span className='text-[9px] font-black uppercase tracking-wider text-rose-700 whitespace-nowrap'>{job?.jobType}</span>
                </div>
                <div className='flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 rounded-lg'>
                    <span className='h-1.5 w-1.5 rounded-full bg-emerald-400'></span>
                    <span className='text-[9px] font-black uppercase tracking-wider text-emerald-700 whitespace-nowrap'>{job?.salary}LPA</span>
                </div>
            </div>

            <div className='mt-auto flex items-center gap-4 pt-6 border-t border-slate-50'>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/description/${job?._id}`);
                    }}
                    variant="outline"
                    className="flex-[2] border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-2xl h-12 transition-all text-xs font-black uppercase tracking-widest"
                >
                    View Details
                </Button>
                <Button
                    onClick={(e) => {
                        e.stopPropagation();
                        bookmarkHandler();
                    }}
                    className={`flex-1 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl transition-all ${isBookmarked ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'}`}
                >
                    {isBookmarked ? "Saved" : "Save"}
                </Button>
            </div>
        </div>
    )
}

export default Job