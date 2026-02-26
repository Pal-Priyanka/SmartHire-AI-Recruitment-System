import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div>
            <Carousel className="w-full max-w-xl mx-auto my-20">
                <CarouselContent className="-ml-2 md:-ml-4">
                    {
                        category.map((cat, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Button
                                    onClick={() => searchJobHandler(cat)}
                                    variant="outline"
                                    className="w-full rounded-2xl h-12 font-bold bg-white hover:bg-indigo-600 text-slate-900 hover:text-white border-slate-200 hover:border-indigo-400 transition-all shadow-md hover:shadow-indigo-500/20"
                                >
                                    {cat}
                                </Button>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}

export default CategoryCarousel