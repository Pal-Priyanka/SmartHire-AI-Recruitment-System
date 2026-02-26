import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';
import { ANALYTICS_API_END_POINT } from '@/utils/constant';
import { Briefcase, Users, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const RecruiterAnalytics = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get(`${ANALYTICS_API_END_POINT}/recruiter`);
                if (res.data.success) {
                    setData(res.data.analytics);
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
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <h1 className='text-3xl font-bold text-slate-900 mb-8 font-display'>Recruitment <span className='text-indigo-600'>Analytics</span></h1>

                {/* KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{data.totalJobs}</div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{data.activeJobs} Active Now</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Applications</CardTitle>
                            <Users className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{data.totalApplications}</div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">All Time Received</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg AI Score</CardTitle>
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{data.averageAiScore}%</div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Quality Index</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Interviews</CardTitle>
                            <Clock className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900">{data.upcomingInterviews}</div>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Scheduled for this week</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='bg-white p-8 rounded-2xl border border-slate-200 shadow-xl'>
                        <h2 className='text-xl font-bold text-slate-900 mb-8 text-center uppercase tracking-widest text-[12px]'>Application Status Distribution</h2>
                        <div className='h-[300px]'>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight={600} />
                                    <YAxis stroke="#64748b" fontSize={12} fontWeight={600} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className='bg-white p-8 rounded-2xl border border-slate-200 shadow-xl'>
                        <h2 className='text-xl font-bold text-slate-900 mb-8 text-center uppercase tracking-widest text-[12px]'>Talent Pipeline</h2>
                        <div className='h-[300px]'>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={4} stroke="#fff" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterAnalytics;
