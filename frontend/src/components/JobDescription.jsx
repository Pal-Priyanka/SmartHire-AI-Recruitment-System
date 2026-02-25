import Navbar from './shared/Navbar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { User } from 'lucide-react';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true); // Update the local state
                const updatedSingleJob = { ...singleJob, applications: [...singleJob.applications, { applicant: user?._id }] }
                dispatch(setSingleJob(updatedSingleJob)); // helps us to real time UI update
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application => application.applicant === user?._id)) // Ensure the state is in sync with fetched data
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div className='min-h-screen bg-[#0F172A] text-white'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-500'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 bg-[#1E293B] p-8 rounded-3xl border border-gray-800 shadow-2xl'>
                    <div className='space-y-4'>
                        <h1 className='font-extrabold text-4xl md:text-5xl text-white tracking-tight'>{singleJob?.title}</h1>
                        <div className='flex flex-wrap items-center gap-3'>
                            <Badge className='bg-blue-500/10 text-blue-400 border-none font-bold px-4 py-1.5' variant="outline">{singleJob?.postion} Positions</Badge>
                            <Badge className='bg-rose-500/10 text-rose-400 border-none font-bold px-4 py-1.5' variant="outline">{singleJob?.jobType}</Badge>
                            <Badge className='bg-emerald-500/10 text-emerald-400 border-none font-bold px-4 py-1.5' variant="outline">{singleJob?.salary}LPA</Badge>
                        </div>
                    </div>
                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`px-10 py-6 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl ${isApplied
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 active:scale-95'
                            }`}
                    >
                        {isApplied ? 'Application Submitted' : 'Apply For This Role'}
                    </Button>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
                    <div className='lg:col-span-2 space-y-10'>
                        <div className='bg-[#1E293B] p-8 rounded-3xl border border-gray-800 shadow-xl'>
                            <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-3'>
                                <span className='h-8 w-1 bg-indigo-500 rounded-full'></span>
                                Job Description
                            </h2>
                            <p className='text-gray-400 leading-loose text-lg whitespace-pre-line'>
                                {singleJob?.description || "No detailed description provided."}
                            </p>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='bg-[#1E293B] p-8 rounded-3xl border border-gray-800 shadow-xl'>
                            <h2 className='text-xl font-bold text-white mb-6'>Job Overview</h2>
                            <div className='space-y-6'>
                                <div className='flex items-start gap-4'>
                                    <div className='p-2 bg-indigo-500/10 rounded-lg text-indigo-400'><User className='h-5 w-5' /></div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase font-bold tracking-widest'>Role</p>
                                        <p className='text-white font-medium'>{singleJob?.title}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <div className='p-2 bg-emerald-500/10 rounded-lg text-emerald-400'><div className='h-5 w-5 font-bold flex items-center justify-center'>@</div></div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase font-bold tracking-widest'>Location</p>
                                        <p className='text-white font-medium'>{singleJob?.location}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <div className='p-2 bg-amber-500/10 rounded-lg text-amber-400'><div className='h-5 w-5 font-bold flex items-center justify-center'>Exp</div></div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase font-bold tracking-widest'>Experience</p>
                                        <p className='text-white font-medium'>{singleJob?.experience} Years</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <div className='p-2 bg-purple-500/10 rounded-lg text-purple-400'><div className='h-5 w-5 font-bold flex items-center justify-center'>$$</div></div>
                                    <div>
                                        <p className='text-xs text-gray-500 uppercase font-bold tracking-widest'>Annual Salary</p>
                                        <p className='text-white font-medium'>{singleJob?.salary} LPA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-indigo-500/5 p-8 rounded-3xl border border-indigo-500/10 text-center'>
                            <p className='text-gray-400 text-sm mb-1 uppercase font-bold tracking-widest'>Applications Received</p>
                            <span className='text-4xl font-black text-indigo-400'>{singleJob?.applications?.length || 0}</span>
                            <p className='text-gray-500 text-xs mt-3 capitalize italic'>Posted on {singleJob?.createdAt.split("T")[0]}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDescription