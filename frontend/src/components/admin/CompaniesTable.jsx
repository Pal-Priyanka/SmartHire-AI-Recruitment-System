import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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
            const res = await axios.delete(`${COMPANY_API_END_POINT}/delete/${companyId}`, {
                withCredentials: true
            });
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
        <div>
            <Table className="bg-white">
                <TableCaption className="text-slate-400 py-4 font-medium">A list of your registered companies</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Name</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Location</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Website</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                        <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany?.map((company) => (
                            <TableRow key={company._id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                                <TableCell className="font-bold text-slate-900">{company.name}</TableCell>
                                <TableCell className="text-slate-600 font-medium">{company.location || "N/A"}</TableCell>
                                <TableCell className="text-indigo-600 font-medium hover:underline">
                                    {company.website ? (
                                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                                            {company.website}
                                        </a>
                                    ) : "N/A"}
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm font-medium">{company.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-slate-900" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-40 bg-white border-slate-200 text-slate-900 shadow-xl p-2 rounded-xl">
                                            <div className='flex flex-col gap-1'>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => navigate(`/admin/companies/${company._id}`)}
                                                    className='flex items-center justify-start gap-2 w-full px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group h-auto'
                                                >
                                                    <Edit2 className='w-4 h-4 text-slate-400 group-hover:text-indigo-600' />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Edit Details</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => deleteCompanyHandler(company._id)}
                                                    className='flex items-center justify-start gap-2 w-full px-3 py-2 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors group h-auto'
                                                >
                                                    <Trash2 className='w-4 h-4 text-slate-400 group-hover:text-rose-600' />
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-rose-600">Delete</span>
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