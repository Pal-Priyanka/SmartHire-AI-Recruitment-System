import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSearchCompanyByText(input));
    }, [input]);
    return (
        <div className='min-h-screen bg-slate-50'>
            <Navbar />
            <div className='max-w-6xl mx-auto py-10 px-4'>
                <div className='flex items-center justify-between my-8'>
                    <Input
                        className="w-fit bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-indigo-500 rounded-xl"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200" onClick={() => navigate("/admin/companies/create")}>New Company</Button>
                </div>
                <div className='bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
                    <CompaniesTable />
                </div>
            </div>
        </div>
    )
}

export default Companies