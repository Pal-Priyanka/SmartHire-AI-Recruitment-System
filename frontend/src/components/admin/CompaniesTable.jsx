import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { setCompanies } from '@/redux/companySlice'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const filteredCompany = companies.length >= 0 && companies.filter((company) => {
            if (!searchCompanyByText) {
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText])

    const deleteCompanyHandler = async (companyId) => {
        try {
            const res = await api.delete(`${COMPANY_API_END_POINT}/delete/${companyId}`);
            if (res.data.success) {
                const updatedCompanies = companies.filter((company) => company._id !== companyId);
                dispatch(setCompanies(updatedCompanies));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete company");
        }
    }

    return (
        <div className='bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden'>
            <Table>
                <TableCaption className="text-slate-400 py-6 font-medium text-xs uppercase tracking-widest bg-slate-50/50 border-t border-slate-100">A list of your registered companies</TableCaption>
                <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Company Name</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Location</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Status</TableHead>
                        <TableHead className="text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14">Date Joined</TableHead>
                        <TableHead className="text-right text-slate-900 font-black uppercase text-[10px] tracking-[0.15em] h-14 px-6">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany?.map((company) => (
                            <TableRow key={company._id} className="border-slate-50 hover:bg-slate-50/50 transition-all duration-300 group">
                                <TableCell className="px-6 py-4">
                                    <div className='flex items-center gap-3'>
                                        <div className='h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[10px]'>
                                            {company.name.charAt(0)}
                                        </div>
                                        <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight text-sm">{company.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-slate-600 font-bold text-sm tracking-tight">{company.location || "N/A"}</span>
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className='flex items-center gap-1.5'>
                                        <span className={`h-1.5 w-1.5 rounded-full ${company.website ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${company.website ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {company.website ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-4">
                                    <span className="text-slate-400 text-xs font-black uppercase tracking-widest">{company.createdAt.split("T")[0]}</span>
                                </TableCell>
                                <TableCell className="text-right px-6 py-4">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-48 bg-white/90 backdrop-blur-xl border-slate-100 text-slate-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-2 rounded-2xl" align="end">
                                            <div className='flex flex-col gap-1'>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => navigate(`/admin/companies/${company._id}`)}
                                                    className='flex items-center justify-start gap-4 w-full px-4 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-all group h-auto'
                                                >
                                                    <Edit2 className='w-4 h-4 text-slate-400 group-hover:text-indigo-600' />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Edit Settings</span>
                                                </Button>
                                                <div className='h-px bg-slate-50 my-1 mx-2'></div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => deleteCompanyHandler(company._id)}
                                                    className='flex items-center justify-start gap-4 w-full px-4 py-2.5 hover:bg-rose-50 rounded-xl cursor-pointer transition-all group h-auto'
                                                >
                                                    <Trash2 className='w-4 h-4 text-slate-400 group-hover:text-rose-600' />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 group-hover:text-rose-600">Delete Profile</span>
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default CompaniesTable