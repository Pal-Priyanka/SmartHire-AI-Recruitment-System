import React, { useState, useEffect } from 'react';
import Navbar from './shared/Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sparkles, ArrowLeft, GraduationCap, Lightbulb, UserCheck, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import api from '@/lib/api';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PrepKit = () => {
    const params = useParams();
    const navigate = useNavigate();
    const applicationId = params.id;

    const [loading, setLoading] = useState(true);
    const [kit, setKit] = useState(null);

    useEffect(() => {
        const fetchPrepKit = async () => {
            try {
                const res = await api.get(`${APPLICATION_API_END_POINT}/${applicationId}/prep-kit`);
                if (res.data.success) {
                    setKit(res.data.prepKit);
                }
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || "Failed to generate your prep kit");
            } finally {
                setLoading(false);
            }
        };

        fetchPrepKit();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="h-20 w-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-8 font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 font-black">Generating Your Winning Strategy...</p>
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
                    className="mb-8 hover:bg-white rounded-xl text-slate-500 hover:text-emerald-600 transition-all group"
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Application
                </Button>

                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-emerald-600 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
                    <GraduationCap className="absolute -left-10 -bottom-10 h-64 w-64 opacity-10 -rotate-12" />
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Interview Prep Kit</h1>
                        <p className="text-emerald-100 font-bold uppercase tracking-widest text-xs opacity-80">Tailored Intelligence to help you dominate</p>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-md">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Company Culture</p>
                            <p className="text-sm font-black">{kit?.vibeCheck?.culture || "Professional"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Tactical Edge */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tactical Edge</h3>
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                "{kit?.tacticalEdge}"
                            </p>
                        </section>

                        <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/60">Success Priority</h3>
                            </div>
                            <p className="text-sm font-black leading-relaxed">
                                {kit?.vibeCheck?.priority}
                            </p>
                        </section>
                    </div>

                    {/* Right: Questions */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Technical Questions */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Lightbulb className="h-5 w-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Technical Gauntlet</h2>
                            </div>
                            <div className="space-y-6">
                                {kit?.technical?.map((q, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 hover:border-blue-200 transition-all"
                                    >
                                        <h4 className="text-sm font-black text-slate-900 mb-4 leading-relaxed">Q: {q.question}</h4>
                                        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCheck className="h-3 w-3 text-blue-600" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Golden Answer Guide</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{q.answerGuide}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Behavioral Questions */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Behavioral Insight</h2>
                            </div>
                            <div className="space-y-6">
                                {kit?.behavioral?.map((q, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 hover:border-purple-200 transition-all"
                                    >
                                        <h4 className="text-sm font-black text-slate-900 mb-4 leading-relaxed">Q: {q.question}</h4>
                                        <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <UserCheck className="h-3 w-3 text-purple-600" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">How to handle this</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{q.answerGuide}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrepKit;
