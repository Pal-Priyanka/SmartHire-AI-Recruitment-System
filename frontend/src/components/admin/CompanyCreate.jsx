import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await api.post(`${COMPANY_API_END_POINT}/register`, { companyName }, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (res?.data?.success) {
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='max-w-4xl mx-auto py-20 px-4'>
                <div className='bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl'>
                    <div className='mb-10'>
                        <h1 className='font-black text-3xl text-slate-900 tracking-tight mb-2'>Register Your <span className='text-indigo-600'>Company</span></h1>
                        <p className='text-slate-500 font-medium'>What would you like to call your company? You can always change this later in settings.</p>
                    </div>

                    <div className='space-y-4'>
                        <Label className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]'>Company Name</Label>
                        <Input
                            type="text"
                            className="bg-slate-50 border-slate-200 text-slate-900 h-14 rounded-2xl focus:ring-indigo-500 text-lg px-6"
                            placeholder="e.g. SmartHire, Microsoft, Google"
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>

                    <div className='flex items-center gap-4 mt-12'>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/companies")}
                            className="h-14 px-8 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={registerNewCompany}
                            className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95"
                        >
                            Continue to Setup
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CompanyCreate