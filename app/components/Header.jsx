"use client";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { ChevronDown, UserCircle, LogOut, Bell, Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-end sticky top-0 z-40 w-full">

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-6">
                <button className="text-slate-400 hover:text-slate-950 transition-colors relative">
                    <Bell size={18} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

                <div className="relative">
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-950 group-hover:text-slate-600 transition-colors">
                                {user?.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                {user?.role}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden ring-2 ring-transparent group-hover:ring-slate-100 transition-all">
                            <img
                                src={user?.picture || "/default-avatar.png"}
                                className="w-full h-full object-cover"
                                alt="profile"
                            />
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                    </div>

                    {showDropdown && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                            <div className="absolute right-0 mt-4 w-52 bg-white border border-slate-200 shadow-xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Account</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                                </div>
                                <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-slate-600 transition-colors">
                                    <UserCircle size={16} />
                                    <span className="text-sm font-medium">Profile Setting</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 border-t border-slate-50 transition-colors mt-1"
                                >
                                    <LogOut size={16} />
                                    <span className="text-sm font-bold">Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}