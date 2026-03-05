"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { Edit3, Trash2, Plus, Search, UserCheck, BookOpen, ShieldAlert } from "lucide-react";
import CourseModal from "@/app/components/modals/CourseModal";
import ConfirmModal from "@/app/components/modals/ConfirmModal";
import AssignModal from "@/app/components/modals/AssignModal";
import { useAuth } from "@/app/hooks/useAuth"; // Assuming you have an auth hook

export default function CourseManagement() {
  const { user } = useAuth(); // Get user role from your auth system
  const isAdmin = user?.role === "ADMIN";

  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("ALL");
  const [studentFilter, setStudentFilter] = useState("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [cRes, uRes] = await Promise.all([
        api.get("/course/all"),
        api.post("/user/all")
      ]);
      setCourses(cRes.data.data.courses);
      setAllUsers(uRes.data.data.users);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const teachers = allUsers.filter(u => u.role === 'TEACHER');
  const students = allUsers.filter(u => u.role === 'STUDENT');

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeacher = teacherFilter === "ALL" || c.instructors.some(inst => inst._id === teacherFilter);
      const matchesStudent = studentFilter === "ALL" || c.assignedUsers.some(stud => stud._id === studentFilter);
      return matchesSearch && matchesTeacher && matchesStudent;
    });
  }, [courses, searchQuery, teacherFilter, studentFilter]);

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/course/delete/${deleteId}`);
      toast.success("Course deleted");
      fetchData();
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAssignModal = (course) => {
    setCurrentCourse(course);
    setIsAssignOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-slate-500 text-sm">
            {isAdmin ? "Full curriculum control enabled." : "View your assigned curriculum."}
          </p>
        </div>

        {/* ADD BUTTON: Only for Admins */}
        {isAdmin && (
          <button
            onClick={() => { setCurrentCourse(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all font-semibold shadow-sm w-fit"
          >
            <Plus size={18} /> Add New Course
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 text-sm cursor-pointer"
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
        >
          <option value="ALL">All Instructors</option>
          {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <select
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 text-sm cursor-pointer"
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
        >
          <option value="ALL">All Enrolled Students</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Details</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instructors</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled</th>

              {/* HEADER ACTION: Only show if Admin */}
              {isAdmin && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={isAdmin ? "4" : "3"} className="p-10 text-center text-slate-400 font-medium tracking-tight animate-pulse">Synchronizing Curricula...</td></tr>
            ) : filteredCourses.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                    {c.coursePic ? <img src={c.coursePic} className="w-full h-full object-cover" /> : <BookOpen size={20} className="text-slate-300" />}
                  </div>
                  <div className="max-w-[200px]">
                    <a href={`/course-attendance/${c._id}`} className="font-bold text-sm text-slate-900 truncate hover:text-blue-600 transition-colors">
                      {c.title}
                    </a>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{c.level} • {c.duration}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-xs font-medium text-slate-600 truncate max-w-[150px]">
                    {c.instructors.length > 0 ? c.instructors.map(i => i.name).join(", ") : "Unassigned"}
                  </p>
                </td>
                <td className="p-4">
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-blue-100">
                    {c.assignedUsersCount} Enrolled
                  </span>
                </td>

                {/* ROW ACTIONS: Only for Admins */}
                {isAdmin && (
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-1">
                      <button onClick={() => { setCurrentCourse(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-lg" title="Edit Properties">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => openAssignModal(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg" title="Assign Users">
                        <UserCheck size={18} />
                      </button>
                      <button onClick={() => openDeleteConfirm(c._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg" title="Terminate Course">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && filteredCourses.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <ShieldAlert size={40} className="text-slate-200" />
            <p className="text-slate-400 text-sm font-medium">No courses match your current permissions or filters.</p>
          </div>
        )}
      </div>

      {/* Modals remain, but can only be triggered by buttons that are hidden for non-admins */}
      <CourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={currentCourse} refresh={fetchData} />
      <AssignModal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} course={currentCourse} allUsers={allUsers} refresh={fetchData} />
      <ConfirmModal isOpen={isDeleteOpen} loading={deleteLoading} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Remove Course" message="Are you sure? This will remove the course and unassign all students." />
    </div>
  );
}