import Sidebar from '@/components/Layout/Sidebar'
import { Inter } from 'next/font/google'
import MobileHeader from '@/components/Layout/MobileHeader'
import MobileNavbar from '@/components/Layout/MobileNavbar'
import AuthHandler from "@/components/providers/AuthHandler";

const inter = Inter({ subsets: ['latin'] })

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`flex min-h-screen bg-gray-50 ${inter.className}`}>
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 h-screen overflow-auto w-full">
        {/* Mobile header spacer */}
        <div className="h-16 md:hidden"></div>
        
        {/* Content with responsive padding */}
        <div className="p-4 pb-20 md:p-6 lg:p-8 md:pb-6 min-h-[calc(100vh-4rem)] md:min-h-screen">
          <AuthHandler>{children}</AuthHandler>
        </div>
        
        {/* Mobile navbar spacer */}
        <div className="h-16 md:hidden"></div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileNavbar />
    </div>
  )
}