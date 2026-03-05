"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {  Users, BookOpen, Camera, GraduationCap } from "lucide-react";

const menuItems = [
    { name: "User Management", icon: Users, path: "/users" },
    { name: "Courses", icon: BookOpen, path: "/courses" },
    { name: "Attendance", icon: Camera, path: "/attendance" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64   flex flex-col shrink-0 h-full border-r border-slate-200">
            {/* Header matching height (h-16) */}
            <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-200">
                <div className="bg-white p-1.5 rounded-lg">
                    <GraduationCap size={20} className="text-slate-950" />
                </div>
                {/* Left Section: Title or Search */}
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold text-slate-950 uppercase tracking-tight hidden md:block">
                        Management System
                    </h2>
                </div>

            </div>

            <nav className="flex-1 p-4 space-y-1 mt-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-white text-slate-950 shadow-lg shadow-white/5"
                                : "text-slate-400 hover:bg-slate-600 hover:text-white"
                                }`}
                        >
                            <item.icon size={18} className={isActive ? "text-slate-950" : "group-hover:text-white"} />
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>


            <div className="p-4 border-t border-slate-200">

                <div className="bg-white text-slate-800 p-4 rounded-xl text-center border border-slate-200">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Session</p>
                    <p className="text-sm font-bold text-slate-800">2025 - 2026</p>
                </div>
            </div>
        </aside>
    );
}