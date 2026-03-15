"use client"

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Calendar, MapPin, Plane, Settings, LogOut } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, logout, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-wellnessPink border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-32 pb-20 container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-wellnessPink/10 flex items-center justify-center border-2 border-wellnessPink/20 shadow-inner">
                  <User size={48} className="text-wellnessPink" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
                <div className="w-full pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-deepNavy">
                    <Settings size={18} /> Account Settings
                  </Button>
                  <Button variant="ghost" onClick={logout} className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut size={18} /> Logout
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-deepNavy text-white border-none shadow-xl shadow-deepNavy/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Activity size={18} className="text-wellnessPink" /> Wellness Sync
              </h3>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs opacity-60">Last Cycle Start</p>
                  <p className="font-medium">March 12, 2026</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-xs opacity-60">Health Score</p>
                  <p className="font-medium text-wellnessPink">Optimal ✨</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <header className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-deepNavy">Welcome back, {user.firstName}!</h1>
                <p className="text-gray-500">Here's a snapshot of your wellness and adventures.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="default">Add Log</Button>
                <Button variant="primary">New Trip</Button>
              </div>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upcoming Trip */}
              <Card className="hover:shadow-lg transition-all group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-travelTeal/10 p-3 rounded-2xl text-travelTeal">
                    <Plane size={24} />
                  </div>
                  <span className="bg-travelTeal/10 text-travelTeal text-xs font-bold px-3 py-1 rounded-full">Coming Soon</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Summer in Bali</h3>
                <div className="space-y-3 text-gray-500 text-sm">
                  <p className="flex items-center gap-2"><Calendar size={16} /> June 15 - June 28, 2026</p>
                  <p className="flex items-center gap-2"><MapPin size={16} /> Ubud & Seminyak, Indonesia</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button variant="ghost" className="w-full text-travelTeal hover:bg-travelTeal/5">View Itinerary</Button>
                </div>
              </Card>

              {/* Quick Health Summary */}
              <Card className="hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-wellnessPink/10 p-3 rounded-2xl text-wellnessPink">
                    <Calendar size={24} />
                  </div>
                  <span className="bg-wellnessPink/10 text-wellnessPink text-xs font-bold px-3 py-1 rounded-full">Day 14</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Cycle Overview</h3>
                <p className="text-gray-500 text-sm mb-4">You're currently in the follicular phase. Energy levels are expected to rise!</p>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-wellnessPink w-1/2"></div>
                  </div>
                  <p className="text-xs text-gray-400">14 days until next cycle</p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button variant="ghost" className="w-full text-wellnessPink hover:bg-wellnessPink/5">Log Symptoms</Button>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { title: "Logged morning mood", time: "2 hours ago", type: "Health" },
                  { title: "Added 'Tegalalang Rice Terrace' to Bali Trip", time: "Yesterday", type: "Travel" },
                  { title: "Updated budget goal for June", time: "2 days ago", type: "Finance" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'Health' ? 'bg-wellnessPink' : 'bg-travelTeal'}`}></div>
                      <div>
                        <p className="font-medium text-deepNavy">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{item.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Dummy Activity component since it wasn't imported properly from lucide
function Activity({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}
