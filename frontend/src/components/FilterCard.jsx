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
        <div className='w-full bg-[#1E293B] p-5 rounded-2xl border border-gray-800 shadow-xl'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='font-bold text-xl text-white'>Filters</h1>
                <span className='text-xs text-indigo-400 font-medium cursor-pointer hover:underline' onClick={() => setSelectedValue('')}>Reset All</span>
            </div>
            <div className='space-y-6'>
                {
                    fitlerData.map((data, index) => (
                        <div key={index} className='border-t border-gray-800 pt-4'>
                            <h1 className='font-bold text-sm text-gray-400 uppercase tracking-wider mb-3'>{data.fitlerType}</h1>
                            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                                {
                                    data.array.map((item, idx) => {
                                        const itemId = `id${index}-${idx}`
                                        return (
                                            <div key={itemId} className='flex items-center space-x-3 my-2 group cursor-pointer'>
                                                <RadioGroupItem
                                                    value={item}
                                                    id={itemId}
                                                    className="border-gray-600 text-indigo-500 focus:ring-indigo-500 bg-transparent"
                                                />
                                                <Label
                                                    htmlFor={itemId}
                                                    className="text-gray-300 text-sm font-medium cursor-pointer group-hover:text-white transition-colors"
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