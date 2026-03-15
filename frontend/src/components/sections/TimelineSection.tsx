import { RevealWrapper } from "@/components/ui/RevealWrapper"

export function TimelineSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden" id="how-it-works">
      <div className="container mx-auto px-6 lg:px-12">
        <RevealWrapper direction="none">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold">Your Path to Better Living</h2>
          </div>
        </RevealWrapper>

        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-wellnessPink via-memoryPurple to-travelTeal hidden md:block timeline-line-grow" />

          {/* Step 1 */}
          <div className="relative flex items-center justify-between mb-24 md:flex-row flex-col text-center md:text-left timeline-float">
            <RevealWrapper direction="left" className="md:w-5/12 order-2 md:order-1 mt-8 md:mt-0">
              <h4 className="text-wellnessPink font-bold text-xl mb-2">01. Connect &amp; Setup</h4>
              <p className="text-gray-600">Download the app and invite your partner. Link your calendars and health apps to get everything in one place.</p>
            </RevealWrapper>
            <div className="z-10 bg-wellnessPink w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold order-1 md:order-2 step-number-active">1</div>
            <div className="md:w-5/12 order-3" />
          </div>

          {/* Step 2 */}
          <div className="relative flex items-center justify-between mb-24 md:flex-row flex-col text-center md:text-right timeline-float animate-delay-100">
            <div className="md:w-5/12 order-3 md:order-1" />
            <div className="z-10 bg-memoryPurple w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold order-1 md:order-2 step-number-active">2</div>
            <RevealWrapper direction="right" className="md:w-5/12 order-2 md:order-3 mt-8 md:mt-0">
              <h4 className="text-memoryPurple font-bold text-xl mb-2">02. Track &amp; Discover</h4>
              <p className="text-gray-600">Start logging your wellness patterns. Our AI learns your rhythms to suggest the best times for rest or adventure.</p>
            </RevealWrapper>
          </div>

          {/* Step 3 */}
          <div className="relative flex items-center justify-between mb-24 md:flex-row flex-col text-center md:text-left timeline-float animate-delay-200">
            <RevealWrapper direction="left" className="md:w-5/12 order-2 md:order-1 mt-8 md:mt-0">
              <h4 className="text-travelTeal font-bold text-xl mb-2">03. Plan &amp; Dream</h4>
              <p className="text-gray-600">Use our collaborative tools to build itineraries, manage budgets, and tick off your bucket list items together.</p>
            </RevealWrapper>
            <div className="z-10 bg-travelTeal w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold order-1 md:order-2 step-number-active">3</div>
            <div className="md:w-5/12 order-3" />
          </div>

          {/* Step 4 */}
          <div className="relative flex items-center justify-between md:flex-row flex-col text-center md:text-right timeline-float animate-delay-300">
            <div className="md:w-5/12 order-3 md:order-1" />
            <div className="z-10 bg-budgetGold w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold order-1 md:order-2 step-number-active">4</div>
            <RevealWrapper direction="right" className="md:w-5/12 order-2 md:order-3 mt-8 md:mt-0">
              <h4 className="text-budgetGold font-bold text-xl mb-2">04. Remember &amp; Celebrate</h4>
              <p className="text-gray-600">Capture every moment in your shared gallery. Reflect on your progress and celebrate life's milestones.</p>
            </RevealWrapper>
          </div>
        </div>
      </div>
    </section>
  )
}
