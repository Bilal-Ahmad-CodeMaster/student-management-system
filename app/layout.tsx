import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppLayoutContent from "@/app/components/AppLayoutContent";
import "./globals.css";

// 1. Define the interface for the props
interface RootLayoutProps {
  children: React.ReactNode;
}

// 2. Apply the type to the component arguments
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppLayoutContent>{children}</AppLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}