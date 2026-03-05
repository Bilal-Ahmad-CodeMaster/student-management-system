"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import {
  Calendar,
  ArrowLeft,
  User,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function CourseAttendanceView() {
  const { courseId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/course/attendance/${courseId}?date=${selectedDate}`,
      );
      setData(res.data.data);
    } catch (err) {
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const filteredReport = data?.report.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-slate-900 p-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {data?.courseTitle || "Loading..."}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Daily Attendance Log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-900 text-sm font-bold"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Students
            </p>
            <p className="text-2xl font-bold">{data?.report.length || 0}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <User className="text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              Present Today
            </p>
            <p className="text-2xl font-bold text-green-600">
              {data?.report.filter((r) => r.status === "present").length || 0}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <CheckCircle2 className="text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
              Absent / Pending
            </p>
            <p className="text-2xl font-bold text-red-600">
              {data?.report.filter((r) => r.status !== "present").length || 0}
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <XCircle className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              placeholder="Filter by name..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Student Info
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Marked At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-20 text-center text-slate-400 font-bold animate-pulse"
                  >
                    Fetching Logs...
                  </td>
                </tr>
              ) : (
                filteredReport?.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={
                            student.picture ||
                            `https://ui-avatars.com/api/?name=${student.name}`
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          @{student.userName}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          student.status === "present"
                            ? "bg-green-100 text-green-700"
                            : student.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold">
                          {student.markedAt
                            ? new Date(student.markedAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : "--:--"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
