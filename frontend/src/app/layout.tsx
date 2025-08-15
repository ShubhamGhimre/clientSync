import Sidebar from "@/components/Layout/Sidebar";
import "./globals.css";
import { Inter } from "next/font/google";
import MobileHeader from "@/components/Layout/MobileHeader";
import MobileNavbar from "@/components/Layout/MobileNavbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClientSync",
  description: "AI-powered client support with custom chatbots",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
