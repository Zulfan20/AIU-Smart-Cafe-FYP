"use client"

import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the sheet whenever the URL changes (user navigates)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
        </Button>
      </SheetTrigger>
      {/* Accessibility Fix: 
         Shadcn Sheet requires a Title and Description for screen readers. 
         We can visually hide them if needed or provide meaningful text. 
      */}
      <SheetContent side="left" className="p-0 bg-teal-900 w-72 text-white border-none">
        <div className="sr-only">
          <SheetTitle>Mobile Navigation Menu</SheetTitle>
          <SheetDescription>
            Navigation links for the café owner dashboard
          </SheetDescription>
        </div>
        
        {/* We reuse the existing Sidebar component here! */}
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}