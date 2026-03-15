import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"

export function PricingSection() {
  return (
    <section className="py-24 bg-gray-50" id="pricing">
      <div className="container mx-auto px-6 lg:px-12">
        <RevealWrapper direction="up">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">All Features Are Now Free</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;ve opened up our entire suite of wellness and adventure tools for everyone. Start your journey today, no subscription required.
            </p>
          </div>
        </RevealWrapper>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Essential Journey */}
          <RevealWrapper direction="up" delay={0.1}>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 flex flex-col transition-all hover:shadow-xl h-full">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-deepNavy">Essential Journey</h3>
                <p className="text-travelTeal text-xs font-semibold uppercase tracking-wider">Base Camp Tools</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Basic Cycle Tracking</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> 1 Shared Trip Planner</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Public Bucket List</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Global Community Access</li>
              </ul>
              <Button variant="secondary" className="w-full">Get Started for Free</Button>
            </div>
          </RevealWrapper>

          {/* Soul Nourishment */}
          <RevealWrapper direction="up" delay={0.2} className="relative z-10">
            <div className="bg-white p-10 rounded-3xl border-2 border-wellnessPink shadow-2xl relative flex flex-col md:scale-105 soft-glow h-full">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-wellnessPink text-white px-6 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
                Included for All
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-deepNavy">Soul Nourishment</h3>
                <p className="text-wellnessPink text-xs font-semibold uppercase tracking-wider">Full Wellness Suite</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-2 font-medium"><Check className="text-wellnessPink" size={18} /> Advanced Health &amp; Mood Analytics</li>
                <li className="flex items-center gap-2 font-medium"><Check className="text-wellnessPink" size={18} /> Daily Guided Meditations &amp; Yoga</li>
                <li className="flex items-center gap-2 font-medium"><Check className="text-wellnessPink" size={18} /> Smart Travel Forecasts</li>
                <li className="flex items-center gap-2 font-medium"><Check className="text-wellnessPink" size={18} /> Priority 24/7 Support</li>
              </ul>
              <Button variant="gradient" className="w-full">Get Started for Free</Button>
            </div>
          </RevealWrapper>

          {/* Global Exploration */}
          <RevealWrapper direction="up" delay={0.3}>
            <div className="bg-white p-10 rounded-3xl border border-gray-100 flex flex-col transition-all hover:shadow-xl h-full">
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-deepNavy">Global Exploration</h3>
                <p className="text-memoryPurple text-xs font-semibold uppercase tracking-wider">Premium Adventure</p>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Global Travel AI Personal Guide</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Exclusive Member Global Events</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> 1:1 Adventure &amp; Life Coaching</li>
                <li className="flex items-center gap-2"><Check className="text-green-500" size={18} /> Unlimited Memory Storage</li>
              </ul>
              <Button variant="secondary" className="w-full">Get Started for Free</Button>
            </div>
          </RevealWrapper>
        </div>
      </div>
    </section>
  )
}
