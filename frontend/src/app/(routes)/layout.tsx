import Sidebar from '@/components/Layout/Sidebar'
import { Inter } from 'next/font/google'
import MobileHeader from '@/components/Layout/MobileHeader'
import MobileNavbar from '@/components/Layout/MobileNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ClientSync',
  description: 'AI-powered client support with custom chatbots',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
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
              {children}
            </div>
            
            {/* Mobile navbar spacer */}
            <div className="h-16 md:hidden"></div>
          </main>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <MobileNavbar />
      </body>
    </html>
  )
}