"use client";
import { useState, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { loadModels, getLabeledFaceDescriptions } from "@/app/lib/face-api-util";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { Camera, Loader2, CheckCircle, XCircle, Search, UploadCloud, Info, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation"; // 1. Add this import
export default function AttendancePage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [presentIDs, setPresentIDs] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadModels();
        api.get("/course/all").then(res => setCourses(res.data.data.courses));
    }, []);

    const handleClassPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCourse) return toast.error("Please select a course first!");

        setScanning(true);
        setProgress(0);
        setStatusMessage("Initializing AI Models...");
        setPresentIDs([]);

        try {
            const courseData = courses.find(c => c._id === selectedCourse);
            const students = courseData.assignedUsers;

            if (!students?.length) throw new Error("No students are assigned to this course.");

            // Step 1: Process Student Profiles
            const labeledDescriptors = await getLabeledFaceDescriptions(students, (msg) => {
                setStatusMessage(msg);
                setProgress(prev => Math.min(prev + (100 / students.length / 2), 45));
            });

            if (!labeledDescriptors.length) throw new Error("Failed to extract face data from profiles.");

            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

            // Step 2: Process Class Photo
            setStatusMessage("Optimizing class photo for neural scan...");
            setProgress(60);
            const img = await faceapi.bufferToImage(file);

            const detections = await faceapi
                .detectAllFaces(img)
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                toast.error("No faces detected in the uploaded photo.");
            } else {
                setStatusMessage(`Matching ${detections.length} faces against database...`);
                setProgress(90);
                const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
                const detectedIDs = results
                    .filter(r => r.label !== 'unknown')
                    .map(r => r.label);

                setPresentIDs(detectedIDs);
                setProgress(100);
                toast.success(`Analysis Complete: ${detectedIDs.length} recognized.`);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || "The AI engine encountered an error.");
        } finally {
            setTimeout(() => {
                setScanning(false);
                setStatusMessage("");
            }, 500);
        }
    };

    const submitAttendance = async () => {
        setLoading(true);
        try {
            await api.post("/course/mark-attendance", {
                courseId: selectedCourse,
                presentStudentIds: presentIDs
            });
            toast.success("Attendance successfully synchronized!");
        } catch (err) {
            toast.error("Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 text-slate-900 pb-24 pt-4 px-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Attendance Intelligence</h1>
                <p className="text-slate-500 text-sm">Automated face recognition for streamlined classroom management.</p>
            </div>

            {/* Top Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col justify-center space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <LayoutGrid size={14} /> 1. Select Course
                            </label>
                            <select
                                className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-sm font-medium"
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="">Choose your course...</option>
                                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <UploadCloud size={14} /> 2. Global Scan
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleClassPhotoUpload}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3.5 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Summary Card */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="relative z-10 space-y-2">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Today's Summary</p>
                        <h2 className="text-4xl font-black">{presentIDs.length} <span className="text-lg font-normal text-slate-400">/ {courses.find(c => c._id === selectedCourse)?.assignedUsers.length || 0}</span></h2>
                        <p className="text-slate-400 text-[11px]">Students identified as present</p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 text-white/5 rotate-12"><Camera size={120} /></div>
                </div>
            </div>

            {/* Analysis State */}
            {scanning && (
                <div className="p-12 bg-white rounded-[2rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center"><Info size={24} className="text-slate-900 opacity-20" /></div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-lg font-bold">Neural Scan in Progress</h3>
                        <p className="text-sm text-slate-500 font-mono tracking-tighter">{statusMessage}</p>
                    </div>
                    <div className="w-full max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-900 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Results Grid */}
            {selectedCourse && !scanning && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em]">Manifest Verification</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {courses.find(c => c._id === selectedCourse)?.assignedUsers.map(student => {
                            const isPresent = presentIDs.includes(student._id);
                            return (
                                <div key={student._id} className={`group p-4 rounded-3xl border transition-all duration-300 flex items-center gap-4 ${isPresent ? 'bg-white border-green-200 shadow-lg shadow-green-500/5' : 'bg-white border-slate-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}>
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner">
                                            <img src={student.picture || `https://ui-avatars.com/api/?name=${student.name}`} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        {isPresent && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full border-4 border-white shadow-sm scale-110">
                                                <CheckCircle size={12} fill="currentColor" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate">{student.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">@{student.userName}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Footer Action */}
            {presentIDs.length > 0 && !scanning && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 animate-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={submitAttendance}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/40 active:scale-95 disabled:bg-slate-300"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                        Sync Data to Cloud
                    </button>
                </div>
            )}
        </div>
    );
}