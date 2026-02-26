import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const CompaniesTable = () => {
    const { companies, searchCompanyByText } = useSelector(store => store.company);
    const [filterCompany, setFilterCompany] = useState(companies);
    const navigate = useNavigate();
    useEffect(() => {
        const filteredCompany = companies.length >= 0 && companies.filter((company) => {
            if (!searchCompanyByText) {
                return true
            };
            return company?.name?.toLowerCase().includes(searchCompanyByText.toLowerCase());

        });
        setFilterCompany(filteredCompany);
    }, [companies, searchCompanyByText])
    return (
        <div>
            <Table className="bg-white">
                <TableCaption className="text-slate-400 py-4 font-medium">A list of your registered companies</TableCaption>
                <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Logo</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Name</TableHead>
                        <TableHead className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Date</TableHead>
                        <TableHead className="text-right text-slate-500 font-bold uppercase text-[10px] tracking-wider">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterCompany?.map((company) => (
                            <TableRow key={company._id} className="border-slate-50 hover:bg-slate-50 transition-colors">
                                <TableCell>
                                    <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                                        <AvatarImage src={company.logo} />
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-bold text-slate-900">{company.name}</TableCell>
                                <TableCell className="text-slate-500 text-sm">{company.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal className="text-slate-400 hover:text-slate-900" /></PopoverTrigger>
                                        <PopoverContent className="w-32 bg-white border-slate-200 text-slate-900 shadow-xl">
                                            <div onClick={() => navigate(`/admin/companies/${company._id}`)} className='flex items-center gap-2 w-full px-2 py-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors'>
                                                <Edit2 className='w-4 h-4 text-indigo-600' />
                                                <span className="text-sm font-medium">Edit</span>
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