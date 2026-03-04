import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { JOB_API_END_POINT, USER_API_END_POINT } from '@/utils/constant';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, CheckCircle2, AlertCircle, TrendingUp, Lightbulb,
    ChevronDown, ChevronUp, FileText, Lock, Loader2, UploadCloud,
    Target, Shield, Zap, ArrowUpRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const SmartHireAdvisor = ({ jobId }) => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Upload state
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    // Prevent duplicate fetches
    const hasFetchedRef = useRef(false);
    const [analysisTriggered, setAnalysisTriggered] = useState(false);

    const hasResume = !!user?.profile?.resume;

    // Fetch match insights when resume is present
    const fetchMatchInsights = useCallback(async () => {
        if (!hasResume || hasFetchedRef.current) return;
        hasFetchedRef.current = true;

        try {
            setLoading(true);
            const res = await api.get(`${JOB_API_END_POINT}/match/${jobId}`);
            if (res.data.success) {
                setInsights(res.data.insights);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to generate AI analysis.");
        } finally {
            setLoading(false);
        }
    }, [jobId, hasResume]);

    // Auto-fetch on mount if user already has a resume
    useEffect(() => {
        if (hasResume && !uploading && !analysisTriggered) {
            fetchMatchInsights();
        }
    }, [hasResume, uploading, analysisTriggered, fetchMatchInsights]);

    // Validate file
    const validateFile = (selectedFile) => {
        if (!selectedFile) return false;

        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        const ext = '.' + selectedFile.name.split('.').pop().toLowerCase();

        if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(ext)) {
            toast.error("Invalid file format. Only PDF, DOC, and DOCX files are supported.");
            return false;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error("File size exceeds 5MB limit.");
            return false;
        }

        if (selectedFile.size === 0) {
            toast.error("File appears to be empty. Please select a valid document.");
            return false;
        }

        return true;
    };

    const changeFileHandler = (e) => {
        const selectedFile = e.target.files?.[0];
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
            uploadResume(selectedFile);
        }
    };

    // Drag & drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (validateFile(droppedFile)) {
            setFile(droppedFile);
            uploadResume(droppedFile);
        }
    };

    const uploadResume = async (selectedFile) => {
        try {
            setUploading(true);
            setUploadProgress(10);

            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await api.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(Math.min(percentCompleted, 90));
                }
            });

            if (res.data.success) {
                setUploadProgress(100);
                dispatch(setUser(res.data.user));
                toast.success("Resume uploaded! Starting AI analysis...");

                // Auto-trigger analysis after short delay for UI feedback
                setTimeout(async () => {
                    setUploading(false);
                    setAnalysisTriggered(true);
                    hasFetchedRef.current = false;

                    // Directly trigger analysis
                    try {
                        setLoading(true);
                        const matchRes = await api.get(`${JOB_API_END_POINT}/match/${jobId}`);
                        if (matchRes.data.success) {
                            setInsights(matchRes.data.insights);
                            hasFetchedRef.current = true;
                        }
                    } catch (err) {
                        console.log(err);
                        toast.error("Analysis failed. Please try again.");
                    } finally {
                        setLoading(false);
                    }
                }, 800);
            }
        } catch (error) {
            console.log(error);
            const errorMsg = error.response?.data?.message || "Failed to upload resume.";
            toast.error(errorMsg);
            setUploading(false);
            setUploadProgress(0);
            setFile(null);
        }
    };

    // ──────────────────────────────────────
    // RENDER: Loading / Skeleton State
    // ──────────────────────────────────────
    if (loading) {
        return (
            <div className='bg-white p-10 rounded-[3rem] border border-indigo-100 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.08)] relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32'></div>
                <div className='relative z-10'>
                    <div className='flex items-center gap-4 mb-10'>
                        <div className='h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100'>
                            <Loader2 className='h-6 w-6 text-white animate-spin' />
                        </div>
                        <div>
                            <h2 className='font-black text-2xl text-slate-900 tracking-tight'>SmartHire Advisor</h2>
                            <p className='text-indigo-500 font-medium text-xs animate-pulse'>Analyzing your resume against job requirements...</p>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-12 gap-10 items-center animate-pulse'>
                        <div className='md:col-span-4 flex justify-center'>
                            <div className='h-40 w-40 bg-slate-100 rounded-full'></div>
                        </div>
                        <div className='md:col-span-8 space-y-6'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='h-28 bg-slate-50 rounded-3xl border border-slate-100'></div>
                                <div className='h-28 bg-slate-50 rounded-3xl border border-slate-100'></div>
                            </div>
                            <div className='h-20 bg-slate-50 rounded-3xl border border-slate-100'></div>
                            <div className='h-20 bg-slate-50 rounded-3xl border border-slate-100'></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────
    // RENDER: No Resume — Upload Prompt
    // ──────────────────────────────────────
    if (!hasResume) {
        return (
            <div
                className={`bg-white p-12 rounded-[3.5rem] border-2 border-dashed relative overflow-hidden group transition-all duration-500 ${isDragOver
                    ? 'border-indigo-400 bg-indigo-50/30 scale-[1.01]'
                    : 'border-slate-100 hover:border-indigo-200'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className='absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -mr-24 -mt-24'></div>
                <div className='relative z-10 flex flex-col items-center text-center'>
                    {uploading ? (
                        <>
                            <div className='h-24 w-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative'>
                                <svg className='absolute inset-0 h-full w-full' viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="46" fill="none" stroke="#e0e7ff" strokeWidth="4" />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="46"
                                        fill="none"
                                        stroke="#4f46e5"
                                        strokeWidth="4"
                                        strokeDasharray="289.03"
                                        strokeDashoffset={289.03 - (289.03 * uploadProgress) / 100}
                                        strokeLinecap="round"
                                        className="transform -rotate-90 origin-center transition-all duration-300"
                                    />
                                </svg>
                                <UploadCloud className='h-10 w-10 text-indigo-500 animate-pulse' />
                            </div>
                            <h2 className='font-black text-xl text-slate-900 mb-2 tracking-tight'>Uploading Document...</h2>
                            <p className='text-slate-500 font-medium text-sm'>{uploadProgress}% completed</p>
                            <div className='w-64 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden'>
                                <motion.div
                                    className='h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full'
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className='h-24 w-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 group-hover:bg-indigo-50 group-hover:scale-110 transition-all duration-500'>
                                <Lock className='h-10 w-10 text-slate-300 group-hover:text-indigo-400 transition-colors duration-500' />
                            </div>
                            <h2 className='font-black text-2xl text-slate-900 mb-3 tracking-tight'>AI Analysis Locked</h2>
                            <p className='text-slate-500 max-w-md font-medium leading-relaxed mb-3'>
                                Unlock deep semantic matching and strategic hiring insights by uploading your resume.
                            </p>
                            <p className='text-slate-400 text-sm mb-8'>
                                Drag & drop your file here, or click the button below.
                            </p>

                            <label className='flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all cursor-pointer shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95'>
                                <FileText className='h-4 w-4' />
                                Upload & Analyze Resume
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={changeFileHandler}
                                />
                            </label>
                            <p className='mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest'>PDF, DOC, DOCX up to 5MB</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ──────────────────────────────────────
    // RENDER: No insights yet (edge case)
    // ──────────────────────────────────────
    if (!insights) return null;

    // ──────────────────────────────────────
    // RENDER: Full Analysis Results
    // ──────────────────────────────────────
    const scoreColor = insights.score > 75 ? '#10b981' : insights.score > 50 ? '#6366f1' : '#f59e0b';
    const scoreLabel = insights.score > 75 ? 'Excellent' : insights.score > 50 ? 'Good' : insights.score > 30 ? 'Fair' : 'Low';

    return (
        <div className='bg-white p-10 rounded-[3.5rem] border border-indigo-100 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.08)] relative overflow-hidden group'>
            {/* Background Accent */}
            <div className='absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110'></div>

            <div className='relative z-10'>
                {/* Header */}
                <div className='flex items-center justify-between mb-10'>
                    <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100'>
                            <Sparkles className='h-6 w-6 text-white' />
                        </div>
                        <div>
                            <h2 className='font-black text-2xl text-slate-900 tracking-tight'>SmartHire Advisor</h2>
                            <p className='text-slate-500 font-medium text-xs'>NLP-Powered Semantic Analysis</p>
                        </div>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                        <div className='px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest'>ADVISORY MODE</div>
                        {insights.predictedRole && (
                            <div className='flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-slate-200'>
                                <Target className='h-3.5 w-3.5 text-indigo-400' />
                                Predicted: {insights.predictedRole}
                            </div>
                        )}
                    </div>
                </div>

                {/* Score + Profile Breakdown Grid */}
                <div className='grid grid-cols-1 md:grid-cols-12 gap-10 items-start mb-10'>
                    {/* Match Score Circle */}
                    <div className='md:col-span-4 flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100'>
                        <div className='relative h-40 w-40 flex items-center justify-center'>
                            <svg className='h-full w-full transform -rotate-90'>
                                <circle cx='80' cy='80' r='70' fill='transparent' stroke='#f1f5f9' strokeWidth='12' />
                                <motion.circle
                                    cx='80' cy='80' r='70' fill='transparent'
                                    stroke={scoreColor}
                                    strokeWidth='12'
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * insights.score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap='round'
                                />
                            </svg>
                            <div className='absolute flex flex-col items-center'>
                                <span className='text-4xl font-black text-slate-900'>{insights.score}%</span>
                                <span className='text-[10px] font-black uppercase tracking-widest' style={{ color: scoreColor }}>{scoreLabel}</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-1.5 mt-4'>
                            <Target className='h-3.5 w-3.5 text-indigo-500' />
                            <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Semantic Match Score</span>
                        </div>
                    </div>

                    {/* Profile Summary / Extracted Data */}
                    <div className='md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <div className='p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-sm flex flex-col items-center text-center group/card hover:border-indigo-300 transition-colors'>
                            <TrendingUp className='h-6 w-6 text-indigo-500 mb-3 group-hover/card:scale-110 transition-transform' />
                            <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1'>Experience</span>
                            <span className='text-sm font-black text-slate-900'>{insights.experience}</span>
                        </div>
                        <div className='p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-sm flex flex-col items-center text-center group/card hover:border-indigo-300 transition-colors'>
                            <FileText className='h-6 w-6 text-indigo-500 mb-3 group-hover/card:scale-110 transition-transform' />
                            <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1'>Education</span>
                            <span className='text-sm font-black text-slate-900'>{insights.education}</span>
                        </div>
                        <div className='p-6 bg-white border border-indigo-100 rounded-[2rem] shadow-sm flex flex-col items-center text-center group/card hover:border-indigo-300 transition-colors'>
                            <Shield className='h-6 w-6 text-indigo-500 mb-3 group-hover/card:scale-110 transition-transform' />
                            <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1'>Certifications</span>
                            <span className='text-sm font-black text-slate-900'>
                                {insights.certifications && insights.certifications.length > 0 ? `${insights.certifications.length} Detected` : "None Found"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Skills Breakdown */}
                <div className='space-y-5'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        {/* Matching Skills */}
                        <div className='bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100/50'>
                            <div className='flex items-center gap-2 mb-3'>
                                <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                                <span className='font-black text-[10px] uppercase tracking-wider text-emerald-700'>Matching Skills</span>
                                {insights.matchingSkills.length > 0 && (
                                    <span className='ml-auto text-[10px] font-bold text-emerald-500'>{insights.matchingSkills.length} found</span>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {insights.matchingSkills.length > 0 ? (
                                    insights.matchingSkills.map((skill, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className='px-3 py-1.5 bg-white border border-emerald-100 rounded-xl text-[10px] font-bold text-emerald-700 capitalize shadow-sm'
                                        >
                                            {skill}
                                        </motion.span>
                                    ))
                                ) : (
                                    <span className='text-[10px] font-medium text-slate-400 italic'>No direct skill matches detected</span>
                                )}
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div className='bg-amber-50/30 p-5 rounded-3xl border border-amber-100/50'>
                            <div className='flex items-center gap-2 mb-3'>
                                <AlertCircle className='h-4 w-4 text-amber-500' />
                                <span className='font-black text-[10px] uppercase tracking-wider text-amber-700'>Missing Skills</span>
                                {insights.missingSkills.length > 0 && (
                                    <span className='ml-auto text-[10px] font-bold text-amber-500'>{insights.missingSkills.length} gaps</span>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {insights.missingSkills.length > 0 ? (
                                    insights.missingSkills.map((skill, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className='px-3 py-1.5 bg-white border border-amber-100/50 rounded-xl text-[10px] font-bold text-amber-600 capitalize shadow-sm'
                                        >
                                            {skill}
                                        </motion.span>
                                    ))
                                ) : (
                                    <span className='text-[10px] font-medium text-emerald-500'>✓ No skill gaps detected — great alignment!</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Certifications Box (if any exist) */}
                    {insights.certifications && insights.certifications.length > 0 && (
                        <div className='bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50'>
                            <div className='flex items-center gap-2 mb-3'>
                                <Zap className='h-4 w-4 text-indigo-500' />
                                <span className='font-black text-[10px] uppercase tracking-wider text-indigo-700'>Detected Certifications</span>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {insights.certifications.map((cert, i) => (
                                    <span key={i} className='px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold tracking-tight shadow-lg shadow-indigo-100/50 flex items-center gap-2 hover:scale-105 transition-transform'>
                                        <div className='h-1.5 w-1.5 rounded-full bg-indigo-400'></div>
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Expandable Deep Insights */}
                <div className='mt-8 pt-8 border-t border-slate-50'>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className='w-full flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 transition-colors group/expand'
                    >
                        {expanded ? 'Hide Strategic Insights' : 'Reveal Strategic Insights'}
                        {expanded ? <ChevronUp className='h-4 w-4 group-hover/expand:-translate-y-0.5 transition-transform' /> : <ChevronDown className='h-4 w-4 group-hover/expand:translate-y-0.5 transition-transform' />}
                    </button>

                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className='overflow-hidden'
                            >
                                <div className='pt-8 space-y-8'>
                                    {/* Row 1: Strength Areas + Gap Insights */}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        {/* Strength Areas */}
                                        <div className='bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50'>
                                            <h4 className='flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4'>
                                                <Shield className='h-3.5 w-3.5' />
                                                Strength Areas
                                            </h4>
                                            <ul className='space-y-3'>
                                                {insights.strengthAreas?.map((area, i) => (
                                                    <li key={i} className='flex items-start gap-3 text-sm text-slate-600 font-medium'>
                                                        <TrendingUp className='h-4 w-4 text-indigo-400 mt-0.5 shrink-0' />
                                                        <span>{area}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Skill Gap Insights */}
                                        <div className='bg-amber-50/20 p-6 rounded-[2rem] border border-amber-100/30'>
                                            <h4 className='flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4'>
                                                <Zap className='h-3.5 w-3.5' />
                                                Skill Gap Insights
                                            </h4>
                                            <p className='text-slate-600 text-sm font-medium leading-relaxed'>
                                                {insights.gapInsights}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Row 2: How to Improve */}
                                    <div className='bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 rounded-[2rem] border border-slate-100'>
                                        <h4 className='flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5'>
                                            <Lightbulb className='h-3.5 w-3.5 text-amber-500' />
                                            How to Improve Your Match
                                        </h4>
                                        <ul className='space-y-4'>
                                            {insights.improvementTips?.map((tip, i) => (
                                                <li key={i} className='flex items-start gap-3 text-sm text-slate-600 font-medium'>
                                                    <div className='h-5 w-5 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5'>
                                                        <ArrowUpRight className='h-3 w-3 text-indigo-600' />
                                                    </div>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SmartHireAdvisor;
