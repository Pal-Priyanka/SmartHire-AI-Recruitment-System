import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'
import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

const fitlerData = [
    {
        fitlerType: "Location",
        array: ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
    },
    {
        fitlerType: "Industry",
        array: ["Frontend Developer", "Backend Developer", "FullStack Developer"]
    },
    {
        fitlerType: "Salary",
        array: ["0-40k", "42-1lakh", "1lakh to 5lakh"]
    },
]

const FilterCard = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const dispatch = useDispatch();
    const changeHandler = (value) => {
        setSelectedValue(value);
    }
    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue]);
    return (
        <div className='w-full bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]'>
            <div className='mb-8'>
                <Link to="/saved-jobs">
                    <Button
                        variant="secondary"
                        className="w-full h-14 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-100 flex items-center justify-center gap-3 transition-all group/saved"
                    >
                        <Bookmark className="h-5 w-5 group-hover/saved:fill-indigo-600 transition-all" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Your Bookmarks</span>
                    </Button>
                </Link>
            </div>
            <div className='flex items-center justify-between mb-10'>
                <h1 className='font-black text-2xl text-slate-900 tracking-tighter'>Refine</h1>
                <Button
                    variant="ghost"
                    size="sm"
                    className='text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 px-3 h-8 rounded-xl'
                    onClick={() => setSelectedValue('')}
                >
                    Clear All
                </Button>
            </div>
            <div className='space-y-10'>
                {
                    fitlerData.map((data, index) => (
                        <div key={index} className='group'>
                            <h2 className='font-black text-[10px] text-slate-400 uppercase tracking-[0.25em] mb-6 group-hover:text-indigo-500 transition-colors'>{data.fitlerType}</h2>
                            <RadioGroup value={selectedValue} onValueChange={changeHandler} className="gap-4">
                                {
                                    data.array.map((item, idx) => {
                                        const itemId = `id${index}-${idx}`
                                        return (
                                            <div key={itemId} className='flex items-center space-x-3 group/item cursor-pointer'>
                                                <RadioGroupItem
                                                    value={item}
                                                    id={itemId}
                                                    className="w-5 h-5 border-2 border-slate-200 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-white transition-all data-[state=checked]:border-indigo-600"
                                                />
                                                <Label
                                                    htmlFor={itemId}
                                                    className="text-slate-600 text-sm font-bold cursor-pointer group-hover/item:text-slate-900 transition-colors uppercase tracking-tight"
                                                >
                                                    {item}
                                                </Label>
                                            </div>
                                        )
                                    })
                                }
                            </RadioGroup>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default FilterCard