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
        <div className='min-h-screen bg-[#0F172A]'>
            <Navbar />
            <div className='max-w-6xl mx-auto py-10 px-4'>
                <div className='flex items-center justify-between my-8'>
                    <Input
                        className="w-fit bg-[#1E293B] border-gray-700 text-white placeholder-gray-500"
                        placeholder="Filter by name"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button className="bg-[#6366F1] hover:bg-[#4f46e5]" onClick={() => navigate("/admin/companies/create")}>New Company</Button>
                </div>
                <div className='bg-[#1E293B] rounded-xl border border-gray-800 shadow-xl overflow-hidden'>
                    <CompaniesTable />
                </div>
            </div>
        </div>
    )
}

export default Companies