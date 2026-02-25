import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-6 my-16'>
                <span className='mx-auto px-6 py-2 rounded-full bg-[#1E293B] text-[#6366F1] font-semibold text-sm border border-[#6366F1]/20 shadow-lg shadow-indigo-500/10 animate-pulse'>
                    No. 1 AI-Powered Recruitment Platform
                </span>
                <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight text-white'>
                    Hire the Best <br /> with <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400'>Smart Analytics</span>
                </h1>
                <p className='text-gray-400 max-w-2xl mx-auto text-lg'>
                    Revolutionize your hiring process with AI-driven screening, automated scheduling, and real-time candidate deep-dives.
                </p>
                <div className='flex w-[90%] md:w-[50%] bg-[#1E293B] border border-gray-700 p-1 rounded-full items-center gap-4 mx-auto focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all shadow-xl'>
                    <input
                        type="text"
                        placeholder='Search for roles, skills, or companies...'
                        onChange={(e) => setQuery(e.target.value)}
                        className='bg-transparent outline-none border-none w-full px-5 text-white placeholder-gray-500'
                    />
                    <Button onClick={searchJobHandler} className="rounded-full bg-[#6366F1] hover:bg-[#4f46e5] h-12 w-12 p-0 flex items-center justify-center transition-transform hover:scale-105">
                        <Search className='h-5 w-5 text-white' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection