"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Camera, Loader2, X, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/app/lib/axios";

export default function CourseModal({ isOpen, onClose, course, refresh }) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [errors, setErrors] = useState({});

    const initialState = {
        title: "",
        description: "",
        price: "",
        duration: "",
        level: "Beginner",
        status: "active",
        notes: ""
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || "",
                description: course.description || "",
                price: course.price || "",
                duration: course.duration || "",
                level: course.level || "Beginner",
                status: course.status || "active",
                notes: course.notes || ""
            });
        } else {
            setFormData(initialState);
        }
        setErrors({});
        setSelectedFile(null);
    }, [course, isOpen]);

    const previewUrl = useMemo(() => {
        if (selectedFile) return URL.createObjectURL(selectedFile);
        return course?.coursePic || null;
    }, [selectedFile, course]);

    const validate = () => {
        let newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.price) newErrors.price = "Price is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });
        if (selectedFile) data.append("coursePic", selectedFile);

        try {
            if (course) {
                await api.put(`/course/update/${course._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Course updated");
            } else {
                await api.post("/course/add", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Course created");
            }
            refresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="font-bold text-xl text-slate-900">{course ? "Edit Course" : "Create New Course"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Curriculum Management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Course Picture */}
                    <div className="flex justify-center pb-2">
                        <div className="relative group cursor-pointer">
                            <div className="w-full h-32 min-w-48 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-slate-400">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Course" />
                                ) : (
                                    <BookOpen className="text-slate-300" size={32} />
                                )}
                            </div>
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Course Title *</label>
                        <input
                            placeholder="e.g. Full Stack Web Development"
                            className={`w-full border ${errors.title ? 'border-red-500' : 'border-slate-200'} p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900`}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description *</label>
                        <textarea
                            rows="3"
                            placeholder="Brief overview of the course content..."
                            className={`w-full border ${errors.description ? 'border-red-500' : 'border-slate-200'} p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900 resize-none`}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Price ($) *</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                            <input
                                placeholder="e.g. 3 Months"
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900"
                                value={formData.duration}
                                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Level</label>
                            <select
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900"
                                value={formData.level}
                                onChange={e => setFormData({ ...formData, level: e.target.value })}
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
                            <select
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white text-slate-900"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-slate-200/50"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (course ? "Update Course" : "Create Course")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}