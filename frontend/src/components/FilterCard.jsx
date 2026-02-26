import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

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
        <div className='w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50'>
            <div className='flex items-center justify-between mb-8'>
                <h1 className='font-black text-2xl text-slate-900 tracking-tight'>Filters</h1>
                <span className='text-xs text-indigo-600 font-black uppercase tracking-widest cursor-pointer hover:text-indigo-800 transition-colors' onClick={() => setSelectedValue('')}>Reset All</span>
            </div>
            <div className='space-y-8'>
                {
                    fitlerData.map((data, index) => (
                        <div key={index} className='border-t border-slate-50 pt-6'>
                            <h1 className='font-black text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4'>{data.fitlerType}</h1>
                            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                                {
                                    data.array.map((item, idx) => {
                                        const itemId = `id${index}-${idx}`
                                        return (
                                            <div key={itemId} className='flex items-center space-x-3 my-3 group cursor-pointer'>
                                                <RadioGroupItem
                                                    value={item}
                                                    id={itemId}
                                                    className="border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white"
                                                />
                                                <Label
                                                    htmlFor={itemId}
                                                    className="text-slate-600 text-sm font-bold cursor-pointer group-hover:text-slate-900 transition-colors"
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