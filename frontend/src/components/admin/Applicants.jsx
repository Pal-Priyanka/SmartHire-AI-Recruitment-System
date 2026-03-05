import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import api from '@/lib/api';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await api.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`);
                dispatch(setAllApplicants(res.data.job));
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllApplicants();
    }, [params.id, dispatch]);
    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4'>
                <h1 className='font-extrabold text-3xl my-8 text-slate-900 flex items-center gap-4'>
                    Applicants for this Job
                    <Badge className='bg-indigo-600 text-white border-none px-4 py-1.5 text-lg'>{applicants?.applications?.length || 0}</Badge>
                    <a
                        href={`${api.defaults.baseURL}/jobs/${params.id}/export-resumes`}
                        download
                        className="ml-auto"
                    >
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            Export All Resumes
                        </Button>
                    </a>
                </h1>
                <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
                    <ApplicantsTable />
                </div>
            </div>
        </div>
    )
}

export default Applicants