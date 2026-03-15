import { Navbar } from "@/components/shared/Navbar"
import { Footer } from "@/components/shared/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { TimelineSection } from "@/components/sections/TimelineSection"
import { StatsTestimonialsSection } from "@/components/sections/StatsTestimonialsSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { CtaSection } from "@/components/sections/CtaSection"

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TimelineSection />
        <StatsTestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
