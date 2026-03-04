import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Bookmark, LogOut, User2, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { AUTH_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import NotificationBell from './NotificationBell'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await api.get(`${AUTH_API_END_POINT}/logout`);
            if (res.data.success) {
                dispatch(setUser(null));
                localStorage.removeItem("user"); // Clear any potentially persisted state
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }
    return (
        <div className='bg-white/80 backdrop-blur-xl border-b border-slate-200/50 text-slate-900 sticky top-0 z-50 shadow-[0_2px_15px_rgba(0,0,0,0.02)]'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-20 px-6'>
                <div>
                    <h1 className='text-2xl font-black tracking-tighter'>Smart<span className='text-indigo-600'>Hire</span></h1>
                </div>
                <div className='flex items-center gap-10'>
                    <ul className='hidden md:flex font-black uppercase text-[10px] tracking-widest items-center gap-8'>
                        {
                            user && user.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies" className="text-slate-500 hover:text-indigo-600 transition-colors">Companies</Link></li>
                                    <li><Link to="/admin/jobs" className="text-slate-500 hover:text-indigo-600 transition-colors">Jobs</Link></li>
                                    <li><Link to="/admin/interviews" className="text-slate-500 hover:text-indigo-600 transition-colors">Interviews</Link></li>
                                    <li><Link to="/admin/analytics" className="text-slate-500 hover:text-indigo-600 transition-colors">Analytics</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/" className="text-slate-500 hover:text-indigo-600 transition-colors">Home</Link></li>
                                    <li><Link to="/jobs" className="text-slate-500 hover:text-indigo-600 transition-colors">Jobs</Link></li>
                                    <li><Link to="/interviews" className="text-slate-500 hover:text-indigo-600 transition-colors">Interviews</Link></li>
                                    <li><Link to="/browse" className="text-slate-500 hover:text-indigo-600 transition-colors">Browse</Link></li>
                                </>
                            )
                        }
                    </ul>
                    <div className='flex items-center gap-4 pl-8 border-l border-slate-100'>
                        {user && <NotificationBell />}
                        {
                            !user ? (
                                <div className='flex items-center gap-4'>
                                    <Link to="/login"><Button variant="ghost" className="text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px]">Login</Button></Link>
                                    <Link to="/signup"><Button className="bg-slate-900 hover:bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] px-6 h-11 rounded-xl shadow-lg transition-all active:scale-95">Signup</Button></Link>
                                </div>
                            ) : (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Avatar className="cursor-pointer h-10 w-10 border-2 border-slate-100 hover:border-indigo-500 hover:scale-105 transition-all outline outline-offset-2 outline-transparent hover:outline-indigo-100">
                                            <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                        </Avatar>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 bg-white border-slate-100 text-slate-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] p-6 mt-4">
                                        <div className='space-y-6'>
                                            <div className='flex items-center gap-4'>
                                                <Avatar className="h-14 w-14 border-2 border-indigo-50">
                                                    <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                                </Avatar>
                                                <div>
                                                    <h4 className='font-black text-slate-900 tracking-tight'>{user?.fullname}</h4>
                                                    <p className='text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5'>{user?.role}</p>
                                                </div>
                                            </div>
                                            <div className='h-px bg-slate-50'></div>
                                            <div className='flex flex-col space-y-2'>
                                                {
                                                    user && user.role === 'candidate' && (
                                                        <>
                                                            <Link to="/profile" className='flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 rounded-2xl cursor-pointer transition-all group'>
                                                                <User2 className="text-slate-400 group-hover:text-indigo-600 h-5 w-5 transition-colors" />
                                                                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">View Profile</span>
                                                            </Link>
                                                            <Link to="/saved-jobs" className='flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 rounded-2xl cursor-pointer transition-all group'>
                                                                <Bookmark className="text-slate-400 group-hover:text-indigo-600 h-5 w-5 transition-colors" />
                                                                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Saved Jobs</span>
                                                            </Link>
                                                            <Link to="/interviews" className='flex w-full items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 rounded-2xl cursor-pointer transition-all group'>
                                                                <Calendar className="text-slate-400 group-hover:text-indigo-600 h-5 w-5 transition-colors" />
                                                                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600">Interviews</span>
                                                            </Link>
                                                        </>
                                                    )
                                                }
                                                <div onClick={logoutHandler} className='flex w-full items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-2xl cursor-pointer transition-all group'>
                                                    <LogOut className="text-slate-400 group-hover:text-rose-600 h-5 w-5 transition-colors" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-rose-600">Logout</span>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar