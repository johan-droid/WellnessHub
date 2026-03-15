import { RevealWrapper } from "@/components/ui/RevealWrapper"
import { Button } from "@/components/ui/Button"

export function CtaSection() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <RevealWrapper direction="up">
        <div className="bg-cta-gradient rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-display font-bold mb-8">Ready to Transform Your Wellness &amp; Travel Story?</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">Join thousands of people living their best, most organized, and adventurous lives today.</p>
            <Button size="lg" variant="primary" className="text-xl font-extrabold px-12 py-6">
              Start Free Today
            </Button>
            <p className="mt-6 text-sm opacity-70">No credit card required. Cancel anytime.</p>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl animate-delay-200" />
        </div>
      </RevealWrapper>
    </section>
  )
}
