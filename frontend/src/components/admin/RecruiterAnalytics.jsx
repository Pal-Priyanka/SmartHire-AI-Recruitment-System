import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { ANALYTICS_API_END_POINT } from '@/utils/constant';
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';



const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const RecruiterAnalytics = () => {
    const [data, setData] = useState(null);
    const [forecastData, setForecastData] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`${ANALYTICS_API_END_POINT}/recruiter`);
                if (res.data.success) {
                    setData(res.data.analytics);
                }

                const forecastRes = await api.get(`${ANALYTICS_API_END_POINT}/forecast`);
                if (forecastRes.data.success) {
                    setForecastData(forecastRes.data.forecast);
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };
        fetchAnalytics();
    }, []);

    if (!data) return <div className="text-slate-900 text-center mt-20 font-bold text-xl">Loading Analytics...</div>;

    const chartData = Object.keys(data.statusDistribution).map(key => ({
        name: key,
        value: data.statusDistribution[key]
    }));

    return (
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-6'>
                <div className='flex items-center justify-between mb-12'>
                    <div>
                        <h1 className='text-4xl font-black text-slate-900 tracking-tight'>Recruitment <span className='text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4'>Analytics</span></h1>
                        <p className='text-slate-500 font-medium mt-2'>Real-time insights and predictive hiring intelligence</p>
                    </div>
                    <div className='hidden md:flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm'>
                        <div className='h-2 w-2 bg-emerald-500 rounded-full animate-pulse'></div>
                        <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Live System Status</span>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-12'>
                    <Card className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Jobs</CardTitle>
                            <div className='h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center'>
                                <Briefcase className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{data.totalJobs}</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className='h-1 w-1 bg-indigo-400 rounded-full'></span>
                                {data.activeJobs} Active
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applications</CardTitle>
                            <div className='h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center'>
                                <Users className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{data.totalApplications}</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className='h-1 w-1 bg-emerald-400 rounded-full'></span>
                                Total Pool
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quality Index</CardTitle>
                            <div className='h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center'>
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{data.averageAiScore}%</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className='h-1 w-1 bg-purple-400 rounded-full'></span>
                                Avg AI Score
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Upcoming</CardTitle>
                            <div className='h-8 w-8 bg-amber-50 rounded-lg flex items-center justify-center'>
                                <Clock className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-4xl font-black text-slate-900 tracking-tighter">{data.upcomingInterviews}</div>
                            <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest flex items-center gap-1.5">
                                <span className='h-1 w-1 bg-amber-400 rounded-full'></span>
                                Interviews
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className='space-y-12'>
                    {/* Primary Dashboard Row */}
                    <div className='grid grid-cols-1 lg:grid-cols-12 gap-10'>
                        <div className='lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50'>
                            <div className='flex items-center justify-between mb-10'>
                                <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-3'>
                                    <span className='h-2 w-2 bg-indigo-600 rounded-full'></span>
                                    Application Status Distribution
                                </h2>
                            </div>
                            <div className='h-[400px]'>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <defs>
                                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                                                <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} fontWeight={900} tickFormatter={(value) => value.toUpperCase()} />
                                        <YAxis stroke="#cbd5e1" fontSize={10} fontWeight={900} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="url(#barGradient)" radius={[12, 12, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className='lg:col-span-4 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col'>
                            <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-emerald-500 rounded-full'></span>
                                Talent Pipeline
                            </h2>
                            <div className='flex-1 h-[300px]'>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className='mt-8 flex flex-wrap gap-4 justify-center'>
                                {chartData.map((entry, index) => (
                                    <div key={index} className='flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full'>
                                        <div className='h-1.5 w-1.5 rounded-full' style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className='text-[8px] font-black text-slate-500 uppercase tracking-widest'>{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Predictive AI Section */}
                    {/* (Existing Time-to-Fill Chart remains here) */}

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
                        {/* Attrition Analysis */}
                        <div className='bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50'>
                            <h2 className='text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-rose-500 rounded-full'></span>
                                Attrition Analysis (Withdrawal Reasons)
                            </h2>
                            <div className='h-[300px]'>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.keys(data.withdrawalReasons || {}).map(key => ({ name: key, value: data.withdrawalReasons[key] }))}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={8}
                                        >
                                            {Object.keys(data.withdrawalReasons || {}).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA'][index % 5]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Market Pay Benchmarking */}
                        <div className='bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl'>
                            <h2 className='text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-10 flex items-center gap-3'>
                                <span className='h-2 w-2 bg-indigo-500 rounded-full'></span>
                                Market Pay Benchmarking
                            </h2>
                            <div className='h-[300px]'>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.salaryBenchmarking || []}>
                                        <XAxis dataKey="title" hide />
                                        <YAxis stroke="rgba(255,255,255,0.1)" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                                        />
                                        <Bar dataKey="current" fill="#6366F1" radius={[8, 8, 0, 0]} name="Offered" />
                                        <Bar dataKey="market" fill="#F472B6" radius={[8, 8, 0, 0]} name="Market Avg" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className='text-[9px] text-slate-400 mt-6 font-medium text-center italic'>Comparing your offered salaries against AI-predicted market rates based on JD keywords.</p>
                        </div>
                    </div>

                    <div className='bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl shadow-indigo-200/20 relative overflow-hidden'>
                        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64'></div>
                        <div className='relative z-10'>
                            <div className='flex items-center justify-between mb-16'>
                                <div>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <h2 className='text-3xl font-black tracking-tight'>Predictive <span className='text-indigo-400'>Time-to-Fill</span></h2>
                                        <Badge className='bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[9px] font-black uppercase tracking-widest py-1'>AI Forecasting</Badge>
                                    </div>
                                    <p className='text-indigo-100/60 font-medium'>Anticipated hiring timelines based on historical category performance</p>
                                </div>
                                <div className='flex flex-col items-end gap-1'>
                                    <div className='px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10'>Operational Intelligence</div>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-center'>
                                <div className='h-[350px]'>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={forecastData} layout="vertical">
                                            <defs>
                                                <linearGradient id="forecastGradient" x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#C7D2FE" stopOpacity={1} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis type="number" stroke="rgba(255,255,255,0.1)" hide />
                                            <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={9} fontWeight={900} axisLine={false} tickLine={false} width={80} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                            <Bar dataKey="averageDays" fill="url(#forecastGradient)" radius={[0, 10, 10, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className='grid grid-cols-2 gap-6'>
                                    {forecastData.slice(0, 4).map((f, i) => (
                                        <div key={i} className='p-6 bg-white/5 backdrop-blur-sm border border-white/5 rounded-[2.5rem] group hover:bg-white/10 transition-colors'>
                                            <p className='text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4'>{f.category}</p>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-4xl font-black tracking-tighter'>{f.averageDays}</span>
                                                <span className='text-[10px] font-black text-indigo-200/40 uppercase tracking-widest'>Days</span>
                                            </div>
                                            <div className='mt-4 flex items-center gap-2'>
                                                <div className={`h-1 w-1 rounded-full ${f.status === 'High Confidence' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                                                <span className='text-[8px] font-bold text-slate-400 uppercase tracking-widest'>{f.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterAnalytics;
