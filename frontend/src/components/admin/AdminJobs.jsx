import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className='min-h-screen bg-[#0F172A]'>
      <Navbar />
      <div className='max-w-6xl mx-auto py-10 px-4'>
        <div className='flex items-center justify-between my-8'>
          <Input
            className="w-fit bg-[#1E293B] border-gray-700 text-white placeholder-gray-500"
            placeholder="Filter by name, role"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button className="bg-[#6366F1] hover:bg-[#4f46e5]" onClick={() => navigate("/admin/jobs/create")}>New Jobs</Button>
        </div>
        <div className='bg-[#1E293B] rounded-xl border border-gray-800 shadow-xl overflow-hidden'>
          <AdminJobsTable />
        </div>
      </div>
    </div>
  )
}

export default AdminJobs