import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';
import { INTERVIEW_API_END_POINT } from '@/utils/constant';

const ScheduleInterviewDialog = ({ open, setOpen, application }) => {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        scheduledDate: '',
        scheduledTime: '',
        duration: '60',
        type: 'Technical',
        format: 'Video',
        meetLink: '',
        notes: ''
    });

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (name, value) => {
        setInput({ ...input, [name]: value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await api.post(`${INTERVIEW_API_END_POINT}/`, {
                applicationId: application?._id,
                candidateId: application?.applicant?._id || application?.applicant,
                jobId: application?.job?._id || application?.job,
                ...input
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setOpen(false);
                // Optionally reload or update state
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Scheduling failed. Check for conflicts.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-[2rem] border-slate-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Schedule <span className='text-indigo-600'>Interview</span></DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</Label>
                            <Input
                                type="date"
                                name="scheduledDate"
                                value={input.scheduledDate}
                                onChange={changeEventHandler}
                                className="rounded-xl border-slate-100 focus:ring-indigo-500 h-11"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</Label>
                                <Input
                                    type="time"
                                    name="scheduledTime"
                                    value={input.scheduledTime}
                                    onChange={changeEventHandler}
                                    className="rounded-xl border-slate-100 focus:ring-indigo-500 h-11"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Min)</Label>
                                <Input
                                    type="number"
                                    name="duration"
                                    value={input.duration}
                                    onChange={changeEventHandler}
                                    className="rounded-xl border-slate-100 focus:ring-indigo-500 h-11"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</Label>
                                <Select onValueChange={(v) => selectChangeHandler('type', v)} defaultValue={input.type}>
                                    <SelectTrigger className="rounded-xl border-slate-100 h-11">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Technical">Technical</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="Cultural">Cultural</SelectItem>
                                        <SelectItem value="Final">Final</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</Label>
                                <Select onValueChange={(v) => selectChangeHandler('format', v)} defaultValue={input.format}>
                                    <SelectTrigger className="rounded-xl border-slate-100 h-11">
                                        <SelectValue placeholder="Select Format" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Video">Video</SelectItem>
                                        <SelectItem value="Phone">Phone</SelectItem>
                                        <SelectItem value="In-Person">In-Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Link / Location</Label>
                            <Input
                                type="text"
                                name="meetLink"
                                placeholder="Google Meet link or Office address"
                                value={input.meetLink}
                                onChange={changeEventHandler}
                                className="rounded-xl border-slate-100 focus:ring-indigo-500 h-11"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-indigo-100">
                            {loading ? "Scheduling Intelligence..." : "Confirm Schedule"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ScheduleInterviewDialog;
