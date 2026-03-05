"use client";
import { useState, useEffect } from "react";
import * as faceapi from 'face-api.js';
import { loadModels, getLabeledFaceDescriptions } from "@/app/lib/face-api-util";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { Camera, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AttendancePage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [presentIDs, setPresentIDs] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        loadModels();
        api.get("/course/all").then(res => setCourses(res.data.data.courses));
    }, []);

    // Helper: Resize massive images to speed up AI detection
    const resizeImage = (img, maxWidth = 1200) => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    };

    const handleClassPhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedCourse) return toast.error("Select course first!");

        setScanning(true);
        setStatusMessage("Initializing Neural Engine...");
        setPresentIDs([]);

        try {
            const courseData = courses.find(c => c._id === selectedCourse);
            const students = courseData.assignedUsers;

            if (!students || students.length === 0) {
                throw new Error("No students are assigned to this course.");
            }

            // Step 1: Process Student Profiles (Pass resizeImage and Message setter)
            const labeledDescriptors = await getLabeledFaceDescriptions(students, setStatusMessage);

            if (labeledDescriptors.length === 0) {
                throw new Error("No usable face data found in student profiles.");
            }

            const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.55);

            // Step 2: Load and Resize Class Photo
            setStatusMessage("Optimizing class photo for scanning...");
            const originalImg = await faceapi.bufferToImage(file);
            const optimizedCanvas = resizeImage(originalImg, 1200); // 1200px is perfect for group shots

            setStatusMessage("Scanning optimized photo... (This will be much faster now)");

            // Step 3: Neural Detection
            const detections = await faceapi
                .detectAllFaces(optimizedCanvas)
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (detections.length === 0) {
                toast.error("No faces detected in the uploaded photo.");
            } else {
                // Step 4: Match IDs
                setStatusMessage(`Matching ${detections.length} detected faces...`);
                const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor));
                const detectedIDs = results
                    .filter(r => r.label !== 'unknown')
                    .map(r => r.label);

                setPresentIDs(detectedIDs);
                toast.success(`Analysis Complete: ${detectedIDs.length} recognized.`);
            }
        } catch (err) {
            console.error("Processing Error:", err);
            toast.error(err.message || "The AI engine encountered an error.");
        } finally {
            setScanning(false);
            setStatusMessage("");
        }
    };

    const submitAttendance = async () => {
        if (presentIDs.length === 0) {
            return toast.error("No recognized students to save.");
        }

        setLoading(true);
        try {
            // We send the array of IDs identified by Face-API
            const response = await api.post("/course/mark-attendance", {
                courseId: selectedCourse,
                presentStudentIds: presentIDs
            });

            if (response.data.meta.status === "success") {
                toast.success(response.data.meta.message);
                // Optional: Clear selection after success
                // setPresentIDs([]);
            }
        } catch (err) {
            console.error("Submission Error:", err);
            toast.error(err.response?.data?.meta?.message || "Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 text-slate-900 pb-20 px-4">
            {/* Header and Controls */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">AI Attendance Scanner</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">1. Select Course</label>
                        <select
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-slate-900 transition-all text-sm"
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            <option value="">Choose a course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">2. Upload Class Photo</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleClassPhotoUpload}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis UI */}
            {scanning && (
                <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-xl animate-in fade-in zoom-in duration-300">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-25"></div>
                        <Loader2 className="animate-spin text-slate-900 relative z-10" size={48} />
                    </div>
                    <span className="font-bold text-lg text-slate-900">Neural Engine Analyzing...</span>
                    <p className="text-sm text-slate-500 mt-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                        {statusMessage}
                    </p>
                </div>
            )}

            {/* Student Grid */}
            {selectedCourse && !scanning && (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enrolled Students</h2>
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            {presentIDs.length} Identified
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.find(c => c._id === selectedCourse)?.assignedUsers.map(student => {
                            const isPresent = presentIDs.includes(student._id);
                            return (
                                <div key={student._id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between shadow-sm ${isPresent ? 'bg-green-50/50 border-green-200' : 'bg-white border-slate-100 opacity-60'
                                    }`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                                            <img
                                                src={student.picture || "https://ui-avatars.com/api/?name=" + student.name}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">@{student.userName}</p>
                                        </div>
                                    </div>
                                    {isPresent ? (
                                        <div className="bg-green-500 p-1.5 rounded-full"><CheckCircle className="text-white" size={14} /></div>
                                    ) : (
                                        <XCircle className="text-slate-200" size={24} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Submission Button */}
            {presentIDs.length > 0 && !scanning && (
                <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center">
                    <button
                        onClick={submitAttendance}
                        disabled={loading}
                        className="max-w-md w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/30 active:scale-[0.98] disabled:bg-slate-300"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                        Save Attendance Record
                    </button>
                </div>
            )}
        </div>
    );
}