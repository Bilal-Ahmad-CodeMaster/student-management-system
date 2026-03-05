"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/app/lib/axios";
import toast from "react-hot-toast";
import { Edit3, Trash2, Plus, Search, Filter } from "lucide-react";
import UserModal from "@/app/components/modals/UserModal";
import ConfirmModal from "@/app/components/modals/ConfirmModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Delete States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.post("/user/all");
      setUsers(res.data.data.users);
      setCounts(res.data.data.counts);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filter Logic: Calculated whenever searchQuery, roleFilter, or users change
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/user/${deleteId}`);
      toast.success("User deleted successfully");
      fetchUsers();
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-slate-500 text-sm">Manage students, teachers, and administrators.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 transition-all font-semibold shadow-sm w-fit"
        >
          <Plus size={18} /> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(counts).map(([role, count]) => (
          <div key={role} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{role}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative group min-w-[160px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
          <select
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 transition-all text-sm appearance-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase font-sans">User Info</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase font-sans">Role</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase font-sans">Email</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase font-sans text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium">Loading data...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-slate-400 font-medium">No users found matching your criteria.</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    <img src={u.picture || "/avatar.png"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm text-slate-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">@{u.userName}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${u.role === 'ADMIN' ? 'bg-slate-900 text-white' :
                      u.role === 'TEACHER' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 truncate">{u.email}</td>
                <td className="p-4">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(u._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
        refresh={fetchUsers}
      />

      <ConfirmModal
        isOpen={isDeleteOpen}
        loading={deleteLoading}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to remove this user? This will also delete their attendance records."
      />
    </div>
  );
}