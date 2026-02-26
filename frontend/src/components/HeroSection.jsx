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
                <span className='mx-auto px-6 py-2 rounded-full bg-slate-100 text-indigo-600 font-semibold text-sm border border-indigo-100 shadow-sm animate-pulse'>
                    No. 1 AI-Powered Recruitment Platform
                </span>
                <h1 className='text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900'>
                    Hire the Best <br /> with <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'>Smart Analytics</span>
                </h1>
                <p className='text-slate-500 max-w-2xl mx-auto text-lg'>
                    Revolutionize your hiring process with AI-driven screening, automated scheduling, and real-time candidate deep-dives.
                </p>
                <div className='flex w-[90%] md:w-[50%] bg-white border border-slate-200 p-1 rounded-full items-center gap-4 mx-auto focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-lg'>
                    <input
                        type="text"
                        placeholder='Search for roles, skills, or companies...'
                        onChange={(e) => setQuery(e.target.value)}
                        className='bg-transparent outline-none border-none w-full px-5 text-slate-900 placeholder-slate-400'
                    />
                    <Button onClick={searchJobHandler} className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-12 w-12 p-0 flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-indigo-200">
                        <Search className='h-5 w-5 text-white' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HeroSection