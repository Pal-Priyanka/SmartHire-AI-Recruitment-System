import React, { useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Contact, Mail, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
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

    return (
        <div className='min-h-screen bg-[#0F172A] pb-10 text-white'>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-[#1E293B] border border-gray-800 rounded-2xl my-8 p-10 shadow-2xl'>
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-6'>
                        <Avatar className="h-24 w-24 border-2 border-indigo-500/50">
                            <AvatarImage src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"} alt="profile" />
                        </Avatar>
                        <div>
                            <h1 className='font-bold text-3xl text-white'>{user?.fullname}</h1>
                            <p className='text-gray-400 mt-2 text-lg leading-relaxed'>{user?.profile?.bio || "No bio added yet."}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className="bg-[#6366F1] hover:bg-[#4f46e5] text-white rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0" variant="ghost">
                        <Pen className="h-4 w-4" />
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-10 bg-black/20 p-6 rounded-xl border border-gray-800/50'>
                    <div className='flex items-center gap-4 text-gray-300'>
                        <div className='p-2 bg-indigo-500/10 rounded-lg'>
                            <Mail className='h-5 w-5 text-indigo-400' />
                        </div>
                        <span className='font-medium'>{user?.email}</span>
                    </div>
                    <div className='flex items-center gap-4 text-gray-300'>
                        <div className='p-2 bg-emerald-500/10 rounded-lg'>
                            <Contact className='h-5 w-5 text-emerald-400' />
                        </div>
                        <span className='font-medium'>{user?.phoneNumber || "Not provided"}</span>
                    </div>
                </div>

                <div className='my-10'>
                    <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                        <span className='h-2 w-2 bg-indigo-500 rounded-full'></span>
                        Core Skills
                    </h2>
                    <div className='flex flex-wrap items-center gap-2'>
                        {
                            user?.profile?.skills.length !== 0 ? user?.profile?.skills.map((item, index) => (
                                <Badge key={index} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 hover:bg-indigo-500/20 transition-colors">
                                    {item}
                                </Badge>
                            )) : <span className='text-gray-500 italic'>No skills listed</span>
                        }
                    </div>
                </div>

                <div className='grid w-full items-center gap-3 bg-indigo-500/5 p-6 rounded-xl border border-indigo-500/10'>
                    <Label className="text-lg font-bold text-indigo-400">Professional Resume</Label>
                    {
                        user?.profile?.resume ? (
                            <a target='blank' href={user?.profile?.resume} className='flex items-center gap-2 text-white hover:text-indigo-300 transition-colors font-medium underline underline-offset-4'>
                                <Pen className='h-4 w-4' />
                                {user?.profile?.resumeOriginalName}
                            </a>
                        ) : <span className='text-gray-600 italic'>Resume not uploaded</span>
                    }
                </div>
            </div>

            <div className='max-w-4xl mx-auto mt-12 px-2'>
                <h1 className='font-bold text-2xl mb-6 text-white flex items-center gap-3'>
                    Applied Positions
                    <Badge className='bg-indigo-500 text-white border-none'>{allAppliedJobs?.length || 0}</Badge>
                </h1>
                <div className='bg-[#1E293B] rounded-2xl border border-gray-800 shadow-xl overflow-hidden'>
                    <AppliedJobTable />
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile