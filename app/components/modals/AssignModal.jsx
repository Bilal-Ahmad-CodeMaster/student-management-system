"use client";
import { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Check } from "lucide-react";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";

export default function AssignModal({ isOpen, onClose, course, allUsers, refresh }) {
    const [loading, setLoading] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    // Pre-fill existing assignments when modal opens
    useEffect(() => {
        if (isOpen && course) {
            // Mapping existing IDs from the course object
            const existingTeachers = course.instructors?.map(i => i._id || i) || [];
            const existingStudents = course.assignedUsers?.map(s => s._id || s) || [];

            setSelectedTeachers(existingTeachers);
            setSelectedStudents(existingStudents);
        }
    }, [isOpen, course]);

    if (!isOpen) return null;

    const toggleSelection = (id, type) => {
        if (type === 'TEACHER') {
            setSelectedTeachers(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else {
            setSelectedStudents(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.post("/course/assign", {
                courseId: course._id,
                instructorIds: selectedTeachers,
                studentIds: selectedStudents
            });
            toast.success("Assignments updated successfully!");
            refresh();
            onClose();
        } catch (err) {
            toast.error("Failed to update assignments");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900 truncate max-w-[400px]">Assign to {course?.title}</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select users to manage access</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
                    {/* Teachers Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Teachers ({selectedTeachers.length})</h3>
                        </div>
                        <div className="space-y-1.5">
                            {allUsers.filter(u => u.role === 'TEACHER').map(t => {
                                const isSelected = selectedTeachers.includes(t._id);
                                return (
                                    <div
                                        key={t._id}
                                        onClick={() => toggleSelection(t._id, 'TEACHER')}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{t.name}</span>
                                        {isSelected && <Check size={16} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Students Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Students ({selectedStudents.length})</h3>
                        </div>
                        <div className="space-y-1.5">
                            {allUsers.filter(u => u.role === 'STUDENT').map(s => {
                                const isSelected = selectedStudents.includes(s._id);
                                return (
                                    <div
                                        key={s._id}
                                        onClick={() => toggleSelection(s._id, 'STUDENT')}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{s.name}</span>
                                        {isSelected && <Check size={16} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-200/50 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> Save Assignment</>}
                    </button>
                </div>
            </div>
        </div>
    );
}