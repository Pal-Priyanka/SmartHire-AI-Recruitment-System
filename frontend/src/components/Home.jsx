import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  return (
    <div className='bg-[#0F172A] min-h-screen text-white overflow-x-hidden'>
      <Navbar />
      <div className='animate-in fade-in duration-700'>
        <HeroSection />
        <div className='py-16 bg-gradient-to-b from-[#0F172A] to-[#1E293B]'>
          <CategoryCarousel />
        </div>
        <div className='pb-20'>
          <LatestJobs />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home