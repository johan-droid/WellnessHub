import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Activity, Apple, Plane, Map, Camera, CreditCard } from "lucide-react"
import { Card } from "@/components/ui/Card"

const features = [
  {
    title: "Period Tracking",
    description: "Precision tracking for your menstrual cycle with intelligent predictions and health insights.",
    icon: Activity,
    colorClass: "text-wellnessPink",
    bgClass: "bg-wellnessPink/10",
    hoverBgClass: "group-hover:bg-wellnessPink group-hover:text-white"
  },
  {
    title: "Symptom Logging",
    description: "Understand your body better by logging moods, energy levels, and physical symptoms daily.",
    icon: Apple,
    colorClass: "text-orange-500",
    bgClass: "bg-orange-100",
    hoverBgClass: "group-hover:bg-orange-500 group-hover:text-white"
  },
  {
    title: "Trip Planning",
    description: "Collaborative itineraries that keep everyone on the same page for your next adventure.",
    icon: Plane,
    colorClass: "text-travelTeal",
    bgClass: "bg-travelTeal/10",
    hoverBgClass: "group-hover:bg-travelTeal group-hover:text-white"
  },
  {
    title: "Bucket List",
    description: "Dream big and track your progress through life's most exciting experiences together.",
    icon: Map,
    colorClass: "text-memoryPurple",
    bgClass: "bg-memoryPurple/10",
    hoverBgClass: "group-hover:bg-memoryPurple group-hover:text-white"
  },
  {
    title: "Memory Gallery",
    description: "Store photos and notes from your travels in a private, shared space for your eyes only.",
    icon: Camera,
    colorClass: "text-budgetGold",
    bgClass: "bg-budgetGold/10",
    hoverBgClass: "group-hover:bg-budgetGold group-hover:text-white"
  },
  {
    title: "Budget Management",
    description: "Split costs easily and track expenses to stay within your travel budget without stress.",
    icon: CreditCard,
    colorClass: "text-green-600",
    bgClass: "bg-green-100",
    hoverBgClass: "group-hover:bg-green-600 group-hover:text-white"
  }
]

export function FeaturesSection() {
  return (
    <section className="relative py-32 bg-white" id="features">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-wellnessRose/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-wellnessLavender/20 blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <RevealWrapper direction="up">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-6xl font-display font-bold mb-6 text-deepNavy">Designed for Your Radiance</h2>
            <p className="text-xl text-deepNavy/60">
              A gentle, intuitive platform where your wellness and wanders meet. Softly synced, beautifully tracked.
            </p>
          </div>
        </RevealWrapper>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <RevealWrapper key={idx} direction="up" delay={idx * 0.1}>
              <Card 
                className="feature-card animate-smooth-float group h-full hover:shadow-[0_20px_60px_-15px_rgba(255,133,184,0.3)] hover:-translate-y-6 transition-all duration-700 bg-white/60 backdrop-blur-sm border-white/50"
                style={{ 
                  animationDelay: `${idx * 0.4}s`, 
                  animationDuration: `${5 + (idx % 2)}s` 
                }}
              >
                <div className={`w-16 h-16 ${feature.bgClass} rounded-[1.5rem] flex items-center justify-center ${feature.colorClass} mb-8 ${feature.hoverBgClass} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-deepNavy">{feature.title}</h3>
                <p className="text-deepNavy/60 leading-relaxed">{feature.description}</p>
              </Card>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
