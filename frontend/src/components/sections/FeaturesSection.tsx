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
    <section className="py-24 bg-gray-50" id="features">
      <div className="container mx-auto px-6 lg:px-12">
        <RevealWrapper direction="up">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">Designed for Your Lifestyle</h2>
            <p className="text-xl text-gray-600">
              Everything you need to manage your health and plan your next big escape, all synced in one intuitive platform.
            </p>
          </div>
        </RevealWrapper>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <RevealWrapper key={idx} direction="up" delay={idx * 0.1}>
              <Card 
                className="feature-card animate-smooth-float group h-full hover:shadow-2xl hover:-translate-y-4 transition-all duration-500"
                style={{ animationDelay: `${idx * 1.2}s`, animationDuration: `${6 + (idx % 3)}s` }}
              >
                <div className={`w-14 h-14 ${feature.bgClass} rounded-2xl flex items-center justify-center ${feature.colorClass} mb-6 ${feature.hoverBgClass} transition-colors group-hover:scale-110 duration-300`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  )
}
