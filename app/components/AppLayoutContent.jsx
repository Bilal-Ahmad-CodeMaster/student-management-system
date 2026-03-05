"use client";
import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayoutContent({ children }) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

  
    useEffect(() => {
        if (!loading) {
            if (user && pathname === "/login") {
                router.push("/users");
            }
            if (!user && pathname !== "/login") {
                router.push("/login");
            }
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                </div>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Authenticating...</p>
            </div>
        );
    }

    // Pure Guest View (Login Page)
    if (!user || pathname === "/login") {
        return <main className="w-full h-screen bg-white">{children}</main>;
    }

 
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}