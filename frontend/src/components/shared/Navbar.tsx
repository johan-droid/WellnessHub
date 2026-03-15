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
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-6xl">
      <div className={`
        flex justify-between items-center px-8 py-3 rounded-full border border-white/40 
        transition-all duration-500 backdrop-blur-xl
        ${scrolled 
          ? "bg-white/70 shadow-[0_10px_40px_-10px_rgba(255,133,184,0.3)] border-wellnessPink/20" 
          : "bg-white/40 shadow-xl border-white/50"
        }
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-wellnessPink rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-wellnessPink/30">
            W
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-deepNavy">
            WellnessHub
          </span>
        </div>
        
        {/* Nav Links in their own bubble/tab area */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-white/30 rounded-full border border-white/20 backdrop-blur-md">
          <Link href="#features" className="px-5 py-2 rounded-full text-sm font-medium text-deepNavy/70 hover:text-deepNavy hover:bg-white/50 transition-all duration-300">
            Features
          </Link>
          <Link href="#how-it-works" className="px-5 py-2 rounded-full text-sm font-medium text-deepNavy/70 hover:text-deepNavy hover:bg-white/50 transition-all duration-300">
            How It Works
          </Link>
          <Link href="#pricing" className="px-5 py-2 rounded-full text-sm font-medium text-deepNavy/70 hover:text-deepNavy hover:bg-white/50 transition-all duration-300">
            Pricing
          </Link>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-wellnessPink/5 transition-all">
                <div className="w-8 h-8 rounded-full bg-wellnessPink/20 flex items-center justify-center border border-wellnessPink/30">
                  <User size={16} className="text-wellnessPink" />
                </div>
                <span className="font-medium text-sm text-deepNavy">{user.firstName}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-400 hover:text-red-500 hover:bg-transparent px-2">
                <LogOut size={16} />
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-deepNavy/70 hover:text-deepNavy px-4">
                Login
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-deepNavy text-white hover:bg-deepNavy/90 rounded-full px-6 shadow-md transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
