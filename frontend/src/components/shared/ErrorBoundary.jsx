import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Sparkles, Home, RotateCcw, AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const ErrorBoundary = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    console.error("Route Error:", error);

    return (
        <div className='min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100'>
            <Navbar />

            <main className='flex-grow flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-white to-rose-50/40'>
                <div className='max-w-2xl w-full text-center relative'>
                    {/* Decorative Elements */}
                    <div className='absolute -top-24 -left-24 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl animate-pulse'></div>
                    <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-rose-100/30 rounded-full blur-3xl'></div>

                    <div className='relative z-10 bg-white/70 backdrop-blur-2xl border border-white/50 p-12 md:p-16 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]'>
                        <div className='inline-flex items-center justify-center p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] shadow-2xl shadow-indigo-200/50 mb-10 transform -rotate-6 hover:rotate-0 transition-transform duration-500'>
                            <AlertTriangle className='h-10 w-10 text-white' />
                        </div>

                        <h1 className='text-5xl md:text-6xl font-black text-slate-900 tracking-tightest leading-tight mb-6'>
                            Whoops! <br />
                            <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>Digital Glitch.</span>
                        </h1>

                        <p className='text-lg text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed'>
                            Our algorithms hit an unexpected loop. Don't worry, your data is safe — we just need a quick reset to find the right path.
                        </p>

                        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                            <Button
                                onClick={() => window.location.reload()}
                                className='h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all flex items-center gap-3 w-full sm:w-auto'
                            >
                                <RotateCcw className='h-5 w-5' />
                                Retry Connection
                            </Button>

                            <Button
                                variant='outline'
                                onClick={() => navigate('/')}
                                className='h-14 px-8 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl font-bold flex items-center gap-3 w-full sm:w-auto'
                            >
                                <Home className='h-5 w-5' />
                                Back to Base
                            </Button>
                        </div>

                        {import.meta.env.MODE === 'development' && (
                            <div className='mt-12 p-6 bg-slate-900 rounded-3xl text-left overflow-hidden border border-slate-800 shadow-2xl'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <div className='w-3 h-3 rounded-full bg-rose-500'></div>
                                    <span className='text-[10px] font-black text-rose-400 uppercase tracking-widest'>Debug Terminal</span>
                                </div>
                                <pre className='text-slate-400 text-[11px] font-mono whitespace-pre-wrap break-all leading-relaxed opacity-80'>
                                    {error?.statusText || error?.message || "Internal algorithm failure"}
                                </pre>
                            </div>
                        )}

                        <div className='mt-10 pt-10 border-t border-slate-100/60 flex items-center justify-center gap-2'>
                            <Sparkles className='h-4 w-4 text-indigo-400' />
                            <span className='text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]'>SmartHire Diagnostic Active</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ErrorBoundary;
