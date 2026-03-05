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
        <div className='text-center relative px-4'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10 animate-pulse'></div>

            <div className='flex flex-col gap-8 my-24 items-center'>
                <span className='px-6 py-2 rounded-full glass border border-indigo-100 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] shadow-sm animate-bounce'>
                    Intelligent Workforce Alignment
                </span>

                <h1 className='text-6xl md:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9] max-w-4xl'>
                    Your next big move. <br /> <span className='text-gradient'>Deciphered by AI.</span>
                </h1>

                <p className='text-slate-500 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed opacity-80'>
                    We don't just list jobs. We calculate where you’ll actually thrive using deep semantic analysis.
                </p>

                <div className='flex w-full max-w-3xl bg-white/80 backdrop-blur-3xl border border-slate-200 p-2 rounded-[2rem] items-center gap-4 transition-all hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)] hover:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-2xl'>
                    <div className='flex-1 flex items-center gap-3 px-4'>
                        <Search className='h-5 w-5 text-slate-400' />
                        <input
                            type="text"
                            placeholder='What are we looking for?'
                            onChange={(e) => setQuery(e.target.value)}
                            className='bg-transparent outline-none border-none w-full py-4 text-slate-900 placeholder-slate-400 font-semibold'
                        />
                    </div>
                    <Button onClick={searchJobHandler} className="rounded-2xl bg-slate-900 hover:bg-indigo-600 h-14 px-8 flex items-center justify-center transition-all hover:scale-[1.02] shadow-xl shadow-indigo-200 text-white font-black uppercase tracking-widest text-xs">
                        Find my match
                    </Button>
                </div>

                <div className='flex items-center gap-8 mt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500'>
                    <span className='text-xs font-black uppercase tracking-widest'>Trusted by 500+ Scaleups</span>
                </div>
            </div>
        </div>
    )
}

export default HeroSection
