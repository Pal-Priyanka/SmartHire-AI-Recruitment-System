import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { LogOut, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
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
            const res = await axios.get(`${AUTH_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUser(null));
                localStorage.removeItem("user"); // Clear any potentially persisted state
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }
    return (
        <div className='bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-50 shadow-sm'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <div>
                    <h1 className='text-2xl font-bold tracking-tight'>Smart<span className='text-indigo-600'>Hire</span></h1>
                </div>
                <div className='flex items-center gap-12'>
                    <ul className='flex font-medium items-center gap-5'>
                        {
                            user && user.role === 'recruiter' ? (
                                <>
                                    <li><Link to="/admin/companies" className="hover:text-indigo-600 transition-colors">Companies</Link></li>
                                    <li><Link to="/admin/jobs" className="hover:text-indigo-600 transition-colors">Jobs</Link></li>
                                    <li><Link to="/admin/interviews" className="hover:text-indigo-600 transition-colors">Interviews</Link></li>
                                    <li><Link to="/admin/analytics" className="hover:text-indigo-600 transition-colors">Analytics</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/jobs">Jobs</Link></li>
                                    <li><Link to="/browse">Browse</Link></li>
                                </>
                            )
                        }
                    </ul>
                    {user && <NotificationBell />}
                    {
                        !user ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="ghost" className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-200">Signup</Button></Link>
                            </div>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer border-2 border-slate-200 hover:border-indigo-500 transition-all">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 bg-white border-slate-200 text-slate-900 shadow-xl">
                                    <div className=''>
                                        <div className='flex gap-2 space-y-2 py-2'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                            </Avatar>
                                            <div>
                                                <h4 className='font-bold text-slate-900'>{user?.fullname}</h4>
                                                <p className='text-sm text-slate-500'>{user?.profile?.bio || "Professional User"}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-4 space-y-1'>
                                            {
                                                user && user.role === 'candidate' && (
                                                    <div className='flex w-full items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors'>
                                                        <User2 className="text-slate-500 h-5 w-5" />
                                                        <Link to="/profile" className="text-sm font-medium text-slate-700">View Profile</Link>
                                                    </div>
                                                )
                                            }

                                            <div onClick={logoutHandler} className='flex w-full items-center gap-3 px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer transition-colors'>
                                                <LogOut className="h-5 w-5" />
                                                <span className="text-sm font-medium">Logout</span>
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
    )
}

export default Navbar