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

    if (!data) return <div className="text-white text-center mt-20">Loading Analytics...</div>;

    const chartData = Object.keys(data.statusDistribution).map(key => ({
        name: key,
        value: data.statusDistribution[key]
    }));

    return (
        <div className='min-h-screen bg-[#0F172A]'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <h1 className='text-3xl font-bold text-white mb-8'>Recruitment <span className='text-indigo-500'>Analytics</span></h1>

                {/* KPI Cards */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
                    <Card className="bg-[#1E293B] border-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.totalJobs}</div>
                            <p className="text-xs text-gray-400">{data.activeJobs} Active Now</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1E293B] border-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.totalApplications}</div>
                            <p className="text-xs text-gray-400">All Time Received</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1E293B] border-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg AI Score</CardTitle>
                            <CheckCircle className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.averageAiScore}%</div>
                            <p className="text-xs text-gray-400">Quality Index</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#1E293B] border-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Interviews</CardTitle>
                            <Clock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.upcomingInterviews}</div>
                            <p className="text-xs text-gray-400">Scheduled for this week</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='bg-[#1E293B] p-6 rounded-xl border border-gray-800 shadow-xl'>
                        <h2 className='text-xl font-semibold text-white mb-6 text-center'>Application Status Distribution</h2>
                        <div className='h-[300px]'>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className='bg-[#1E293B] p-6 rounded-xl border border-gray-800 shadow-xl'>
                        <h2 className='text-xl font-semibold text-white mb-6 text-center'>Talent Pipeline</h2>
                        <div className='h-[300px]'>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', color: '#fff' }} />
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
