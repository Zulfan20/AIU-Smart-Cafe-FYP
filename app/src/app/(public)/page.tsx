import { redirect } from 'next/navigation'

export default function Home() {
  // Shopee-style Logic: 
  // Redirect everyone to the menu (Student Dashboard) immediately.
  // Guests can browse; Login is enforced only at checkout.
  redirect('/student-dashboard')
}