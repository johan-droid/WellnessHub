"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { User, LogOut } from "lucide-react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 lg:px-12 flex justify-between items-center ${
        scrolled ? "bg-white shadow-md py-3 text-deepNavy" : "bg-transparent py-4 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-wellnessPink rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[0_0_15px_rgba(255,105,180,0.5)]">
          W
        </div>
        <span className="font-display font-bold text-xl tracking-tight">
          WellnessHub
        </span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 font-medium">
        <a className="hover:text-travelTeal transition-colors" href="#features">Features</a>
        <a className="hover:text-travelTeal transition-colors" href="#how-it-works">How It Works</a>
        <a className="hover:text-travelTeal transition-colors" href="#pricing">Pricing</a>
      </div>

        {!loading && user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <span className={`font-medium text-sm flex items-center gap-2 ${scrolled ? 'text-deepNavy' : 'text-white'}`}>
                <div className="w-8 h-8 rounded-full bg-wellnessPink/20 flex items-center justify-center border border-wellnessPink/30">
                  <User size={16} className={scrolled ? 'text-wellnessPink' : 'text-white'} />
                </div>
                {user.firstName}
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className={`${scrolled ? 'text-gray-500 hover:text-red-500' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant={scrolled ? "ghost" : "glass"} className={scrolled ? "text-deepNavy hover:bg-gray-100" : ""}>
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant={scrolled ? "default" : "primary"}>
                Get Started
              </Button>
            </Link>
          </div>
        )}
    </nav>
  )
}
