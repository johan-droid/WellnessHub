import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Button } from "@/components/ui/Button"
import { Play, Plane, Activity, Calendar } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-hero-gradient gradient-bg-animate">
      {/* Decorative Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl float-elegant"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-travelTeal/30 rounded-full blur-3xl float-elegant animate-delay-200"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-wellnessPink/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-40 right-1/4 w-32 h-32 bg-budgetGold/20 rounded-full blur-2xl animate-smooth-float animate-delay-300"></div>
      <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-memoryPurple/20 rounded-full blur-2xl animate-smooth-float animate-delay-500"></div>
      
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-white space-y-8 framer-entry">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-sm font-medium">
            <span className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400"></div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-500"></div>
            </span>
            Trusted by 50,000+ happy couples
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-tight">
            All Features Are Now Free.<br/>
            <span className="text-white drop-shadow-sm">Live Fully. <span className="text-pink-100">Together.</span></span>
          </h1>
          
          <p className="text-xl opacity-90 max-w-xl">
            Your all-in-one companion for wellness, adventure, and cherished moments together. Sync your health and your travels in one beautiful space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="primary">Start Your Journey</Button>
            <Button size="lg" variant="glass" className="gap-2">
              <Play className="w-5 h-5 fill-current" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="relative hidden lg:block animate-delay-200 framer-entry">
          <div className="relative w-full aspect-square flex items-center justify-center">
            <div className="w-[450px] h-[550px] bg-white rounded-[3rem] shadow-2xl overflow-hidden relative p-8">
              {/* Mock UI Elements */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 bg-wellnessPink/20 rounded-xl flex items-center justify-center text-wellnessPink text-xl">
                    ❤️
                  </div>
                  <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                </div>
                
                <div className="h-40 bg-gradient-to-br from-travelTeal/10 to-memoryPurple/10 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-medium">
                  <Calendar className="mr-2 h-5 w-5" /> Interactive Calendar View
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-travelTeal/5 rounded-2xl p-4">
                    <div className="text-xs font-bold text-travelTeal uppercase flex items-center gap-1"><Plane size={14} /> Next Flight</div>
                    <div className="text-lg font-bold mt-1">Paris, FR</div>
                  </div>
                  <div className="h-24 bg-wellnessPink/5 rounded-2xl p-4">
                    <div className="text-xs font-bold text-wellnessPink uppercase flex items-center gap-1"><Activity size={14} /> Cycle Day</div>
                    <div className="text-lg font-bold mt-1">Day 14</div>
                  </div>
                </div>
                
                <div className="h-32 bg-deepNavy rounded-2xl p-4 text-white">
                  <div className="text-xs font-medium opacity-60">Adventure Goal</div>
                  <div className="mt-2 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-budgetGold w-3/4"></div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm">75% of Bucket List</span>
                    <span className="text-budgetGold font-bold">Keep going!</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Icons */}
            <div className="absolute top-10 right-0 bg-white p-4 rounded-2xl shadow-xl float-elegant animate-delay-100 text-3xl">
              ✈️
            </div>
            <div className="absolute bottom-10 left-0 bg-white p-4 rounded-2xl shadow-xl float-elegant animate-delay-300 text-3xl">
              🧘‍♀️
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
