import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const { singleCompany } = useSelector(store => store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInput({
            name: singleCompany.name || "",
            description: singleCompany.description || "",
            website: singleCompany.website || "",
            location: singleCompany.location || "",
            file: singleCompany.file || null
        })
    }, [singleCompany]);

    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='max-w-2xl mx-auto py-10 px-4'>
                <form onSubmit={submitHandler} className='bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl'>
                    <div className='flex items-center gap-6 mb-10'>
                        <Button onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 text-slate-500 font-bold border-slate-200 hover:bg-slate-50 rounded-xl px-5">
                            <ArrowLeft className='h-4 w-4' />
                            <span>Back</span>
                        </Button>
                        <h1 className='font-black text-2xl text-slate-900 tracking-tight'>Company Setup</h1>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='space-y-2'>
                            <Label className='text-sm font-black text-slate-500 uppercase tracking-widest'>Company Name</Label>
                            <Input
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-sm font-black text-slate-500 uppercase tracking-widest'>Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-sm font-black text-slate-500 uppercase tracking-widest'>Website</Label>
                            <Input
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500"
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label className='text-sm font-black text-slate-500 uppercase tracking-widest'>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500"
                            />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                            <Label className='text-sm font-black text-slate-500 uppercase tracking-widest'>Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={changeFileHandler}
                                className="bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-indigo-500 file:bg-indigo-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg file:mr-4 file:font-bold cursor-pointer"
                            />
                        </div>
                    </div>
                    {
                        loading ? (
                            <Button className="w-full mt-10 bg-indigo-600 h-14 rounded-2xl">
                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                Updating...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg h-14 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]">
                                Update Company Details
                            </Button>
                        )
                    }
                </form>
            </div>

        </div>
    )
}

export default CompanySetup