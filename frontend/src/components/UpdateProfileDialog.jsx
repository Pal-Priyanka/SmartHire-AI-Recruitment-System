import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2, X, FileText, UploadCloud } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/lib/api'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        bio: "",
        skills: "",
        experience: 0,
        education: "",
        certifications: "",
        file: null,        // null = no new file chosen
        removeResume: false // flag to wipe existing resume
    });

    // Reset form every time dialog opens with fresh user data
    useEffect(() => {
        if (open && user) {
            setInput({
                fullname: user?.fullname || "",
                email: user?.email || "",
                phoneNumber: user?.phoneNumber || "",
                bio: user?.profile?.bio || "",
                skills: user?.profile?.skills?.join(", ") || "",
                experience: user?.profile?.experience || 0,
                education: user?.profile?.education || "",
                certifications: user?.profile?.certifications?.join(", ") || "",
                file: null,
                removeResume: false
            });
        }
    }, [open, user]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, file, removeResume: false });
        }
    };

    const removeResumeHandler = () => {
        setInput({ ...input, file: null, removeResume: true });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        formData.append("experience", input.experience);
        formData.append("education", input.education);
        formData.append("certifications", input.certifications);
        formData.append("removeResume", input.removeResume ? "true" : "false");

        // Only append file if user actually picked a new one
        if (input.file instanceof File) {
            formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await api.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Update failed — please try again.");
        } finally {
            setLoading(false);
        }
    };

    // What resume state to show in the UI
    const currentResumeName = user?.profile?.resumeOriginalName;
    const hasExistingResume = !!currentResumeName && !input.removeResume;
    const newFileChosen = input.file instanceof File;

    return (
        <div>
            <Dialog open={open}>
                <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto" onInteractOutside={() => setOpen(false)}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Update <span className='text-indigo-600'>Profile</span>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            {/* Name */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="fullname" className="text-right text-xs font-bold text-slate-500">Name</Label>
                                <Input id="fullname" name="fullname" type="text" value={input.fullname} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Email */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right text-xs font-bold text-slate-500">Email</Label>
                                <Input id="email" name="email" type="email" value={input.email} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Phone */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="phoneNumber" className="text-right text-xs font-bold text-slate-500">Phone</Label>
                                <Input id="phoneNumber" name="phoneNumber" value={input.phoneNumber} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Bio */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right text-xs font-bold text-slate-500">Bio</Label>
                                <Input id="bio" name="bio" value={input.bio} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Skills */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="skills" className="text-right text-xs font-bold text-slate-500">Skills</Label>
                                <Input id="skills" name="skills" placeholder="React, Node, Python..." value={input.skills} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Experience */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="experience" className="text-right text-xs font-bold text-slate-500">Experience (yrs)</Label>
                                <Input id="experience" name="experience" type="number" min="0" value={input.experience} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Education */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="education" className="text-right text-xs font-bold text-slate-500">Education</Label>
                                <Input id="education" name="education" value={input.education} onChange={changeEventHandler} className="col-span-3" />
                            </div>
                            {/* Certifications */}
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="certifications" className="text-right text-xs font-bold text-slate-500">Certs</Label>
                                <Input id="certifications" name="certifications" placeholder="AWS, GCP... (comma separated)" value={input.certifications} onChange={changeEventHandler} className="col-span-3" />
                            </div>

                            {/* Resume Section */}
                            <div className='grid grid-cols-4 items-start gap-4'>
                                <Label className="text-right text-xs font-bold text-slate-500 pt-2">Resume</Label>
                                <div className="col-span-3 space-y-3">
                                    {/* Show current resume if exists and not removed */}
                                    {hasExistingResume && !newFileChosen && (
                                        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                                                <span className="text-xs font-bold text-indigo-700 truncate max-w-[180px]">{currentResumeName}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeResumeHandler}
                                                className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all"
                                                title="Remove resume"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Show selected new file preview */}
                                    {newFileChosen && (
                                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                                                <span className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{input.file.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setInput({ ...input, file: null })}
                                                className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all"
                                                title="Clear selection"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Upload button */}
                                    <label htmlFor="file" className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-slate-500 hover:text-indigo-600 transition-all">
                                        <UploadCloud className="h-4 w-4" />
                                        {newFileChosen ? "Change file" : hasExistingResume ? "Replace resume" : "Upload PDF"}
                                    </label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={fileChangeHandler}
                                        className="hidden"
                                    />

                                    {input.removeResume && !newFileChosen && (
                                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Resume will be removed on save</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            {loading
                                ? <Button className="w-full my-4" disabled><Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...</Button>
                                : <Button type="submit" className="w-full my-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl">Save Changes</Button>
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UpdateProfileDialog;