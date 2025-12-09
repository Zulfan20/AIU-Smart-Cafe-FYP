import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full relative">
      {/* DESKTOP SIDEBAR 
        Hidden on small screens (hidden), visible on medium+ (md:flex)
      */}
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      
      {/* MAIN CONTENT AREA */}
      <main className="md:pl-72">
        {/* MOBILE NAVBAR
           Visible only on small screens to show the hamburger button
        */}
        <div className="flex items-center p-4 md:hidden border-b bg-white">
           <MobileSidebar />
           <span className="font-bold text-lg ml-2 text-teal-700">AIU Café Admin</span>
        </div>

        {children}
      </main>
    </div>
  )
}