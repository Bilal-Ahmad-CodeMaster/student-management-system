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
  Download, // New Icon
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

import autoTable from "jspdf-autotable";
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

  // --- PDF GENERATION LOGIC ---
  const downloadPDF = () => {
    if (!data || !data.report.length) return toast.error("No data to download");

    const doc = new jsPDF();
    const tableColumn = [
      "ID",
      "Student Name",
      "Username",
      "Status",
      "Marked Time",
    ];
    const tableRows = [];

    data.report.forEach((student) => {
      const studentData = [
        student._id,
        student.name,
        student.userName,
        student.status.toUpperCase(),
        student.markedAt
          ? new Date(student.markedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      ];
      tableRows.push(studentData);
    });

    // Header Styling
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Attendance Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Course: ${data.courseTitle}`, 14, 30);
    doc.text(`Date: ${selectedDate}`, 14, 36);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 42);

    // Create the Table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], fontSize: 10, halign: "center" }, // slate-900 background
      columnStyles: {
        3: { halign: "center", fontStyle: "bold" }, // Center align Status column
      },
      styles: { fontSize: 9, cellPadding: 3 },
      didParseCell: function (data) {
        // Color code the status text in the PDF
        if (data.section === "body" && data.column.index === 3) {
          if (data.cell.raw === "PRESENT") {
            data.cell.styles.textColor = [22, 163, 74]; // green-600
          } else if (data.cell.raw === "ABSENT") {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          }
        }
      },
    });

    doc.save(`Attendance_${data.courseTitle}_${selectedDate}.pdf`);
    toast.success("PDF Downloaded Successfully");
  };

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
          {/* PDF Download Button */}
          <button
            onClick={downloadPDF}
            disabled={loading || !data}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:bg-slate-300"
          >
            <Download size={16} />
            Export PDF
          </button>

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
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Enrolled
            </p>
            <p className="text-2xl font-bold">{data?.report.length || 0}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <User className="text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
              Present
            </p>
            <p className="text-2xl font-bold text-green-600">
              {data?.report.filter((r) => r.status === "present").length || 0}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-xl">
            <CheckCircle2 className="text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
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
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
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
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <FileText size={14} />
            <span>Showing {filteredReport?.length} students</span>
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
                    className="p-20 text-center text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs"
                  >
                    Synthesizing Logs...
                  </td>
                </tr>
              ) : (
                filteredReport?.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-slate-100 shadow-inner">
                        <img
                          src={
                            student.picture ||
                            `https://ui-avatars.com/api/?name=${student.name}`
                          }
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">
                          {student.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          ID: {student._id.substring(0, 8)}... • @
                          {student.userName}
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
