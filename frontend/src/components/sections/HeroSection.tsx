import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Button } from "@/components/ui/Button"
import { Play, Plane, Activity, Calendar } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-wellnessPink/20 via-wellnessLavender/30 to-travelTeal/20 animate-gradient-move">
      {/* Organic Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-wellnessPink/30 rounded-full blur-[120px] animate-smooth-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-travelTeal/20 rounded-full blur-[150px] animate-smooth-float animate-delay-300"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-memoryPurple/20 rounded-full blur-[100px] animate-smooth-float animate-delay-500"></div>
      
      {/* Sparkles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse animate-delay-200 shadow-[0_0_8px_white]"></div>
      <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse animate-delay-500 shadow-[0_0_10px_white]"></div>
      
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-deepNavy space-y-8 framer-entry">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 text-sm font-medium text-deepNavy/80">
            <span className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-wellnessPink/20 flex items-center justify-center text-[10px]">✨</div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-wellnessRose/30 flex items-center justify-center text-[10px]">🌸</div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-wellnessLavender/40 flex items-center justify-center text-[10px]">☁️</div>
            </span>
            Join 50,000+ mindful travelers
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight text-deepNavy">
            Your Life,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-wellnessPink to-memoryPurple">Beautifully Sync’d.</span>
          </h1>
          
          <p className="text-xl text-deepNavy/70 max-w-xl">
            A soft, intuitive space for your cycle, your travels, and your most cherished memories. Designed to feel like a breath of fresh air.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="primary" className="bg-wellnessPink hover:bg-wellnessPink/90 shadow-lg shadow-wellnessPink/20">Start Your Journey</Button>
            <Button size="lg" variant="glass" className="gap-2 border-wellnessPink/20 text-wellnessPink hover:bg-wellnessPink/5">
              <Play className="w-5 h-5 fill-current" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative hidden lg:block animate-delay-200 framer-entry">
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* The Main Phone Frame */}
            <div className="w-[450px] h-[550px] bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden relative p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-wellnessPink/20 rounded-xl flex items-center justify-center text-wellnessPink text-xl animate-pulse">
                    🌸
                  </div>
                  <div className="h-4 w-32 bg-gray-100/50 rounded-full"></div>
                </div>
                
                {/* Internal Mockup Cards with Independent Floating */}
                <div className="animate-smooth-float">
                  <div className="h-40 bg-gradient-to-br from-wellnessPink/5 to-wellnessLavender/5 rounded-2xl border-2 border-dashed border-wellnessPink/10 flex items-center justify-center text-wellnessPink/40 font-medium italic">
                    <Calendar className="mr-2 h-5 w-5 text-wellnessPink/30" /> Monthly Radiance View
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-smooth-float animate-delay-200 h-24 bg-travelTeal/10 rounded-2xl p-4 border border-travelTeal/20">
                    <div className="text-[10px] font-bold text-travelTeal uppercase flex items-center gap-1"><Plane size={12} /> Next Bloom</div>
                    <div className="text-lg font-bold mt-1 text-deepNavy">Paris, FR</div>
                  </div>
                  <div className="animate-smooth-float animate-delay-100 h-24 bg-wellnessPink/10 rounded-2xl p-4 border border-wellnessPink/20">
                    <div className="text-[10px] font-bold text-wellnessPink uppercase flex items-center gap-1"><Activity size={12} /> Glow Day</div>
                    <div className="text-lg font-bold mt-1 text-deepNavy">Day 14</div>
                  </div>
                </div>
                
                <div className="animate-smooth-float animate-delay-300 h-32 bg-deepNavy rounded-2xl p-4 text-white shadow-xl">
                  <div className="text-xs font-medium opacity-60">Adventure Goal</div>
                  <div className="mt-2 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-wellnessPink w-3/4 animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm opacity-80 italic">Heart of Bali</span>
                    <span className="text-wellnessPink font-bold">75% Done</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Extra Floating Icons with distinct rhythms */}
            <div className="absolute top-0 -right-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl animate-smooth-float text-3xl border border-white/50">
              ✈️
            </div>
            <div className="absolute bottom-20 -left-10 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl animate-smooth-float animate-delay-200 text-3xl border border-white/50">
              🧘‍♀️
            </div>
            <div className="absolute top-20 -left-6 bg-wellnessPink/10 backdrop-blur-md p-3 rounded-full shadow-lg animate-smooth-float animate-delay-500 text-xl border border-white/30">
              ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
