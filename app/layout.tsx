import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppLayoutContent from "@/app/components/AppLayoutContent"; // Move UI logic here
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster position="top-right" />
          {/* We wrap the UI logic in a separate component inside the Provider */}
          <AppLayoutContent>{children}</AppLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}