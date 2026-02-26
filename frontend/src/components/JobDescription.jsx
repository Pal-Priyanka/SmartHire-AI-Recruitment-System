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
        <div className='min-h-screen bg-slate-50 text-slate-900'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-12 px-4 animate-in fade-in duration-500'>
                <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50'>
                    <div className='space-y-4'>
                        <h1 className='font-black text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight'>{singleJob?.title}</h1>
                        <div className='flex flex-wrap items-center gap-3'>
                            <Badge className='bg-blue-50 text-blue-600 border-none font-bold px-4 py-2 rounded-xl text-sm' variant="outline">{singleJob?.postion} Positions</Badge>
                            <Badge className='bg-rose-50 text-rose-600 border-none font-bold px-4 py-2 rounded-xl text-sm' variant="outline">{singleJob?.jobType}</Badge>
                            <Badge className='bg-emerald-50 text-emerald-600 border-none font-bold px-4 py-2 rounded-xl text-sm' variant="outline">{singleJob?.salary}LPA</Badge>
                        </div>
                    </div>
                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`px-12 py-8 text-xl font-black rounded-2xl transition-all duration-300 shadow-2xl ${isApplied
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
                            }`}
                    >
                        {isApplied ? 'Application Submitted' : 'Apply For This Role'}
                    </Button>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
                    <div className='lg:col-span-2 space-y-10'>
                        <div className='bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl'>
                            <h2 className='text-2xl font-black text-slate-900 mb-8 flex items-center gap-4'>
                                <span className='h-10 w-1.5 bg-indigo-600 rounded-full'></span>
                                Job Description
                            </h2>
                            <p className='text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium'>
                                {singleJob?.description || "No detailed description provided."}
                            </p>
                        </div>
                    </div>

                    <div className='space-y-8'>
                        <div className='bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl'>
                            <h2 className='text-xl font-black text-slate-900 mb-8 uppercase tracking-widest text-[12px]'>Job Overview</h2>
                            <div className='space-y-8'>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-indigo-50 rounded-[1rem] text-indigo-600'><User className='h-6 w-6' /></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Role</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.title}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-emerald-50 rounded-[1rem] text-emerald-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>@</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Location</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.location}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-amber-50 rounded-[1rem] text-amber-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>Exp</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Experience</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.experience} Years</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-5'>
                                    <div className='p-3 bg-purple-50 rounded-[1rem] text-purple-600'><div className='h-6 w-6 font-black flex items-center justify-center text-xl'>$$</div></div>
                                    <div>
                                        <p className='text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]'>Annual Salary</p>
                                        <p className='text-slate-900 font-bold text-lg'>{singleJob?.salary} LPA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-indigo-600 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-200 text-center text-white'>
                            <p className='text-indigo-100 text-xs mb-2 uppercase font-black tracking-[0.2em]'>Applications Received</p>
                            <span className='text-5xl font-black'>{singleJob?.applications?.length || 0}</span>
                            <div className='h-px bg-indigo-500/30 my-6'></div>
                            <p className='text-indigo-100 text-[10px] font-bold uppercase tracking-wider'>Posted on {singleJob?.createdAt.split("T")[0]}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDescription