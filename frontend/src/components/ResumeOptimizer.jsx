import React, { useState, useEffect } from 'react';
import Navbar from './shared/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, ArrowLeft, CheckCircle2, AlertCircle, Zap, Target, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const ResumeOptimizer = () => {
    const params = useParams();
    const navigate = useNavigate();
    const jobId = params.id;
    const { user } = useSelector(store => store.auth);

    const [loading, setLoading] = useState(true);
    const [optimization, setOptimization] = useState(null);
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobRes, optRes] = await Promise.all([
                    api.get(`${JOB_API_END_POINT}/get/${jobId}`),
                    api.get(`${JOB_API_END_POINT}/${jobId}/optimize`)
                ]);

                if (jobRes.data.success) setJob(jobRes.data.job);
                if (optRes.data.success) setOptimization(optRes.data.optimization);
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Failed to load optimization insights");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [jobId, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="h-20 w-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-8 font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">AI is Analyzing Your Potential...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Navbar />
            <div className="max-w-7xl mx-auto py-10 px-4">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="mb-8 hover:bg-white rounded-xl text-slate-500 hover:text-indigo-600 transition-all group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Job
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Job Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">{job?.company?.name}</h2>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight mb-6">{job?.title}</h1>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Strategy Overview</h3>
                                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                                        {optimization?.contentStrategy || "Loading strategy..."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                            <Zap className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Expert Advice</h3>
                            <p className="text-sm font-bold leading-relaxed relative z-10 italic">
                                "{optimization?.overallAdvice}"
                            </p>
                        </div>
                    </div>

                    {/* Right: Optimization Insights */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Missing Keywords Section */}
                        <section className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                                    <Target className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Missing Keywords</h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Boost your ATS readability</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {optimization?.missingKeywords.map((kw, i) => (
                                    <div key={i} className="p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-lg hover:border-indigo-100 border border-transparent transition-all group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{kw.keyword}</span>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${kw.importance === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {kw.importance} priority
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{kw.context}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Suggested Bullet Points Section */}
                        <section className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-12 w-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Magic Bullet Points</h2>
                                    <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest mt-1">Copy & adapt these to your experience</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {optimization?.suggestedBulletPoints.map((bp, i) => (
                                    <div key={i} className="group relative">
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:translate-x-2">
                                            <p className="text-sm font-bold leading-relaxed mb-4 leading-relaxed tracking-wide">
                                                {bp.text}
                                            </p>
                                            <div className="flex items-center gap-2 text-indigo-400">
                                                <div className="h-1 w-1 rounded-full bg-indigo-400 font-black"></div>
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{bp.reason}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeOptimizer;
