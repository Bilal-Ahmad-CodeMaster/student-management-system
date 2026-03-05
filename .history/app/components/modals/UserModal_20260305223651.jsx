"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Camera, Loader2, X, Eye, EyeOff } from "lucide-react"; // Added Eye icons
import toast from "react-hot-toast";
import api from "@/app/lib/axios";

export default function UserModal({ isOpen, onClose, user, refresh }) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPassword, setShowPassword] = useState(false); // New state for password toggle
    const [errors, setErrors] = useState({});

    const initialState = {
        name: "",
        userName: "",
        email: "",
        role: "STUDENT",
        password: "",
        phone: "",
        location: "",
        picture: ""
    };

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                userName: user.userName || "",
                email: user.email || "",
                role: user.role || "STUDENT",
                phone: user.phone || "",
                location: user.location || "",
                picture: user.picture || ""
            });
        } else {
            setFormData(initialState);
        }
        setErrors({});
        setSelectedFile(null);
        setShowPassword(false); // Reset password visibility on open
    }, [user, isOpen]);

    useEffect(() => {
        return () => {
            if (selectedFile) URL.revokeObjectURL(selectedFile);
        };
    }, [selectedFile]);

    const previewUrl = useMemo(() => {
        if (selectedFile) return URL.createObjectURL(selectedFile);
        return formData.picture || null;
    }, [selectedFile, formData.picture]);

    const validate = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Full Name is required";
        if (!formData.userName.trim()) newErrors.userName = "Username is required";
        if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email format";
        if (!user && (!formData.password || formData.password.length < 6)) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const data = new FormData(); // Using FormData for multi-part/binary data
    
        // Professional mapping of text fields
        Object.keys(formData).forEach(key => {
            if (key !== 'picture' && formData[key]) {
                data.append(key, formData[key]);
            }
        });

        // Add binary picture file
        if (selectedFile) {
            data.append("picture", selectedFile);
        }

        try {
            if (user) {
                await api.put(`/user/${user._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Profile updated successfully");
            } else {
                await api.post("/user/create", data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("User created successfully");
            }
            refresh();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Operation failed.");
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
                        <h2 className="font-bold text-xl text-slate-900">{user ? "Edit User Details" : "Register New User"}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Management</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* Picture Selection */}
                    <div className="flex justify-center pb-2">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-slate-400">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Profile Preview" />
                                ) : (
                                    <Camera className="text-slate-300 group-hover:text-slate-500" size={28} />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                                <p className="text-[10px] text-white font-bold uppercase">Upload</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Full Name *</label>
                            <input
                                placeholder="e.g. Andrew Smith"
                                className={`w-full border ${errors.name ? 'border-red-500' : 'border-slate-200'} p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900`}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Username *</label>
                            <input
                                placeholder="e.g. andrew_dev"
                                className={`w-full border ${errors.userName ? 'border-red-500' : 'border-slate-200'} p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900`}
                                value={formData.userName}
                                onChange={e => setFormData({ ...formData, userName: e.target.value })}
                            />
                            {errors.userName && <p className="text-[10px] text-red-500 ml-1">{errors.userName}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Email Address *</label>
                        <input
                            type="email"
                            placeholder="example@mail.com"
                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-slate-200'} p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900`}
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email}</p>}
                    </div>

                    {!user && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-slate-200'} p-3 pr-12 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900`}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Phone Number</label>
                            <input
                                placeholder="+92 305 5825040"
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Location</label>
                            <input
                                placeholder="City, Country"
                                className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-tight">Institutional Role</label>
                        <select
                            className="w-full border border-slate-200 p-3 rounded-xl text-sm outline-none focus:border-slate-900 bg-white transition-all text-slate-900"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:bg-slate-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-slate-200/50"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : (user ? "Update User" : "Create User")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}