"use client";
import { useEffect, useState, useRef } from "react";
import api from "@/app/lib/axios";
import { useAuth } from "@/app/context/AuthContext";
import { User, Mail, Phone, MapPin, Book, Edit3, Save, X, Camera } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/me");
      setProfileData(res.data.data);
      setFormData(res.data.data.user);
    } catch (err) {
      toast.error("Error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleUpdate = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    if (selectedFile) data.append("picture", selectedFile);

    try {
      const res = await api.put("/user/updateMe", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfileData(prev => ({ ...prev, user: res.data.data }));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Profile...</div>;

  const { user, courses } = profileData || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <button
          onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${isEditing ? "bg-green-600 text-white hover:bg-green-700" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
        >
          {isEditing ? <><Save size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Profile</>}
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border p-8 flex flex-col md:flex-row items-center gap-8 relative">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden shrink-0 bg-slate-200">
            <img
              src={selectedFile ? URL.createObjectURL(selectedFile) : (user?.picture || "/avatar.png")}
              className="w-full h-full object-cover"
            />
          </div>
          {isEditing && (
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <Camera size={24} />
            </button>
          )}
          <input type="file" ref={fileInputRef} hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          {isEditing ? (
            <input
              className="text-2xl font-bold border-b border-blue-500 outline-none w-full md:w-auto"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <h2 className="text-3xl font-bold text-slate-800">{user?.name}</h2>
          )}
          <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
            <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">{user?.role}</span>


          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-blue-500" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone size={18} className="text-blue-500" />
              {isEditing ? (
                <input className="text-sm border rounded px-1 w-full" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              ) : (
                <span className="text-sm">{user?.phone || "N/A"}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={18} className="text-blue-500" />
              {isEditing ? (
                <input className="text-sm border rounded px-1 w-full" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              ) : (
                <span className="text-sm">{user?.location || "Not set"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">Enrolled Courses</h3>
          <div className="space-y-3">
            {courses?.length > 0 ? courses.map(course => (
              <div key={course._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><Book size={18} /></div>
                  <p className="font-bold text-sm text-slate-700">{course.title}</p>
                </div>
                <button className="text-xs text-blue-600 font-bold hover:underline">Details</button>
              </div>
            )) : <p className="text-slate-400 text-sm italic py-4">No active courses.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}