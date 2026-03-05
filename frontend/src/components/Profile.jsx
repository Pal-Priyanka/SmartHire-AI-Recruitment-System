import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

// const skills = ["Html", "Css", "Javascript", "Reactjs"]
const isResume = true;

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { allAppliedJobs } = useSelector(store => store.job); // Extracting this correctly

    return (
        <div className='min-h-screen bg-slate-50 pb-20 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900'>
            <Navbar />
            <div className='max-w-4xl mx-auto my-12 px-4'>
                <div className='bg-white rounded-[3rem] border border-slate-100 p-12 premium-shadow relative overflow-hidden group'>
                    {/* Decorative element */}
                    <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110'></div>

                    <div className='relative z-10'>
                        <div className='flex flex-col md:flex-row justify-between items-start gap-8'>
                            <div className='flex flex-col md:flex-row items-center md:items-start gap-8'>
                                <div className='relative'>
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-1 ring-slate-100">
                                        <AvatarImage src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"} alt="profile" />
                                    </Avatar>
                                    <Button
                                        onClick={() => setOpen(true)}
                                        className="absolute -bottom-2 -right-2 bg-indigo-600 hover:bg-indigo-700 text-white border-4 border-white rounded-2xl p-0 h-10 w-10 flex items-center justify-center shadow-xl transition-all hover:scale-110"
                                    >
                                        <Pen className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className='text-center md:text-left pt-2'>
                                    <h1 className='font-black text-4xl text-slate-900 tracking-tighter uppercase'>{user?.fullname}</h1>
                                    <p className='text-slate-500 mt-3 text-lg font-medium leading-relaxed max-w-lg'>{user?.profile?.bio || "No bio yet — a few words go a long way."}</p>

                                    <div className='flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6'>
                                        <div className='flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100'>
                                            <Mail className='h-4 w-4 text-indigo-500' />
                                            <span className='font-black text-[10px] uppercase tracking-widest text-slate-600'>{user?.email}</span>
                                        </div>
                                        <div className='flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100'>
                                            <Contact className='h-4 w-4 text-emerald-500' />
                                            <span className='font-black text-[10px] uppercase tracking-widest text-slate-600'>{user?.phoneNumber || "Not on file"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-12 pt-12 border-t border-slate-50'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
                                <div className='space-y-12'>
                                    <div>
                                        <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2'>
                                            <span className='h-1.5 w-1.5 bg-indigo-600 rounded-full animate-pulse'></span>
                                            Your Toolkit
                                        </h2>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            {
                                                user?.profile?.skills.length !== 0 ? user?.profile?.skills.map((item, index) => (
                                                    <Badge key={index} className="bg-white text-slate-700 border border-slate-100 px-4 py-2 rounded-xl shadow-sm font-black uppercase tracking-widest text-[9px] hover:border-indigo-200 transition-all hover:-translate-y-0.5">
                                                        {item}
                                                    </Badge>
                                                )) : <span className='text-slate-400 font-bold italic text-sm'>Nothing listed yet — let's fix that.</span>
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2'>
                                            <span className='h-1.5 w-1.5 bg-indigo-600 rounded-full animate-pulse'></span>
                                            Professional Journey
                                        </h2>
                                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div className='bg-slate-50 p-4 rounded-2xl border border-slate-100'>
                                                <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Journey</p>
                                                <p className='text-sm font-black text-slate-700'>{user?.profile?.experience || 0} Years</p>
                                            </div>
                                            <div className='bg-slate-50 p-4 rounded-2xl border border-slate-100'>
                                                <p className='text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1'>Credentials</p>
                                                <p className='text-sm font-black text-slate-700 truncate'>{user?.profile?.education || "Not specified yet"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-12'>
                                    <div>
                                        <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2'>
                                            <span className='h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse'></span>
                                            Verified Credentials
                                        </h2>
                                        <div className='flex flex-wrap gap-2'>
                                            {
                                                user?.profile?.certifications?.length > 0 ? (
                                                    user.profile.certifications.map((cert, index) => (
                                                        <Badge key={index} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px]">
                                                            {cert}
                                                        </Badge>
                                                    ))
                                                ) : <span className='text-slate-400 font-bold italic text-sm'>None on record — add them to stand out.</span>
                                            }
                                        </div>
                                    </div>

                                    <div className='relative'>
                                        <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 flex items-center gap-2'>
                                            <span className='h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse'></span>
                                            Your Resume
                                        </h2>
                                        <div className='bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 border-dashed group/resume hover:bg-indigo-50 transition-colors'>
                                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2">Uploaded Document</p>
                                            {
                                                user?.profile?.resume ? (
                                                    <a target='_blank' rel="noopener noreferrer" href={user?.profile?.resume} className='flex items-center gap-3 text-indigo-600 hover:text-indigo-800 transition-all font-black text-sm group/link'>
                                                        <div className='h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover/link:shadow-md transition-all'>
                                                            <Pen className='h-4 w-4 text-indigo-500' />
                                                        </div>
                                                        <span className='border-b-2 border-indigo-100 group-hover/link:border-indigo-600 transition-all font-bold'>{user?.profile?.resumeOriginalName}</span>
                                                    </a>
                                                ) : <span className='text-slate-400 font-bold italic text-sm'>No resume uploaded — let's change that.</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-20'>
                    <div className='flex items-center justify-between mb-8 px-4'>
                        <h1 className='font-black text-2xl text-slate-900 tracking-tighter uppercase flex items-center gap-4'>
                            Your Applications
                            <span className='h-8 px-4 bg-indigo-600 text-white border-none rounded-xl text-xs flex items-center justify-center font-black shadow-lg shadow-indigo-200'>
                                {allAppliedJobs?.length || 0}
                            </span>
                        </h1>
                    </div>
                    <div className='bg-white rounded-[2.5rem] border border-slate-100 premium-shadow overflow-hidden'>
                        <AppliedJobTable />
                    </div>
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile