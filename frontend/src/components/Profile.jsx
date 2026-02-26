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
    const { allAppliedJobs } = useSelector(store => store.job); // Extracting this correctly

    return (
        <div className='min-h-screen bg-slate-50 pb-10 text-slate-900'>
            <Navbar />
            <div className='max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl my-8 p-10 shadow-lg'>
                <div className='flex justify-between items-start'>
                    <div className='flex items-center gap-6'>
                        <Avatar className="h-24 w-24 border-2 border-indigo-100 ring-2 ring-indigo-50">
                            <AvatarImage src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"} alt="profile" />
                        </Avatar>
                        <div>
                            <h1 className='font-bold text-3xl text-slate-900'>{user?.fullname}</h1>
                            <p className='text-slate-500 mt-2 text-lg leading-relaxed'>{user?.profile?.bio || "No bio added yet."}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0" variant="outline">
                        <Pen className="h-4 w-4" />
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-10 bg-slate-50 p-6 rounded-xl border border-slate-100'>
                    <div className='flex items-center gap-4 text-slate-600'>
                        <div className='p-2 bg-indigo-50 rounded-lg'>
                            <Mail className='h-5 w-5 text-indigo-600' />
                        </div>
                        <span className='font-semibold'>{user?.email}</span>
                    </div>
                    <div className='flex items-center gap-4 text-slate-600'>
                        <div className='p-2 bg-emerald-50 rounded-lg'>
                            <Contact className='h-5 w-5 text-emerald-600' />
                        </div>
                        <span className='font-semibold'>{user?.phoneNumber || "Not provided"}</span>
                    </div>
                </div>

                <div className='my-10'>
                    <h2 className='text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 font-display'>
                        <span className='h-2 w-2 bg-indigo-600 rounded-full'></span>
                        Core Skills
                    </h2>
                    <div className='flex flex-wrap items-center gap-2'>
                        {
                            user?.profile?.skills.length !== 0 ? user?.profile?.skills.map((item, index) => (
                                <Badge key={index} className="bg-white text-slate-700 border border-slate-200 px-3 py-1 hover:border-indigo-500 transition-colors shadow-sm font-medium">
                                    {item}
                                </Badge>
                            )) : <span className='text-slate-400 italic'>No skills listed</span>
                        }
                    </div>
                </div>

                <div className='grid w-full items-center gap-3 bg-indigo-50/30 p-6 rounded-xl border border-indigo-100 border-dashed'>
                    <Label className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Professional Resume</Label>
                    {
                        user?.profile?.resume ? (
                            <a target='blank' href={user?.profile?.resume} className='flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors font-bold underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600'>
                                <Pen className='h-4 w-4' />
                                {user?.profile?.resumeOriginalName}
                            </a>
                        ) : <span className='text-slate-400 italic'>Resume not uploaded</span>
                    }
                </div>
            </div>

            <div className='max-w-4xl mx-auto mt-12 px-2'>
                <h1 className='font-bold text-2xl mb-6 text-slate-900 flex items-center gap-3'>
                    Applied Positions
                    <Badge className='bg-indigo-600 text-white border-none px-3 py-0.5'>{allAppliedJobs?.length || 0}</Badge>
                </h1>
                <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
                    <AppliedJobTable />
                </div>
            </div>
            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    )
}

export default Profile