import "@/app/globals.css" // Ensure this path is correct for your project
import { ClientLayout } from "./client-layout" // UPDATED IMPORT PATH

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // Removed <html> and <body> tags to prevent nesting issues
    <ClientLayout>{children}</ClientLayout>
  )
}