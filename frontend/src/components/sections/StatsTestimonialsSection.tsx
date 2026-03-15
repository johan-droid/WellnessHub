import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

export function StatsTestimonialsSection() {
  return (
    <section className="py-24 bg-deepNavy text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
        {/* Stats */}
        <RevealWrapper direction="left">
          <h2 className="text-4xl font-display font-bold mb-12">Growing Every Day</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-5xl font-bold text-wellnessPink mb-2">50K+</div>
              <p className="text-white/60 text-lg">Active Users</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-travelTeal mb-2">2M+</div>
              <p className="text-white/60 text-lg">Cycles Tracked</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-memoryPurple mb-2">150+</div>
              <p className="text-white/60 text-lg">Countries Explored</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-budgetGold mb-2">4.9/5</div>
              <p className="text-white/60 text-lg">App Store Rating</p>
            </div>
          </div>
        </RevealWrapper>

        {/* Testimonials */}
        <RevealWrapper direction="right" className="relative">
          <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-sm">
            <div className="flex gap-1 text-budgetGold mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <p className="text-xl italic leading-relaxed mb-8">
              "WellnessHub completely changed how we plan our lives. Being able to see how my cycle impacts our travel energy levels made our honeymoon so much more enjoyable!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-wellnessPink to-travelTeal" />
              <div>
                <div className="font-bold">Sarah &amp; James</div>
                <div className="text-white/60 text-sm">Members since 2022</div>
              </div>
            </div>
          </div>

          {/* Simple Carousel Nav */}
          <div className="flex gap-2 mt-6 justify-end">
            <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </RevealWrapper>
      </div>
    </section>
  )
}
