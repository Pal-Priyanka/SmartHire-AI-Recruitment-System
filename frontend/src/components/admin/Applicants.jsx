import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import ApplicantsTable from './ApplicantsTable'
import axios from 'axios';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAllApplicants } from '@/redux/applicationSlice';
import { Badge } from '../ui/badge';

const Applicants = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { applicants } = useSelector(store => store.application);

    useEffect(() => {
        const fetchAllApplicants = async () => {
            try {
                const res = await axios.get(`${APPLICATION_API_END_POINT}/${params.id}/applicants`, { withCredentials: true });
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
                </h1>
                <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
                    <ApplicantsTable />
                </div>
            </div>
        </div>
    )
}

export default Applicants