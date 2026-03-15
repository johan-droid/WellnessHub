import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-deepNavy text-white pt-24 pb-12">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-wellnessPink rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(255,105,180,0.5)]">W</div>
              <span className="font-display font-bold text-xl tracking-tight">WellnessHub</span>
            </div>
            <p className="text-white/60">Empowering couples to live healthier, travel further, and remember more together.</p>
            <div className="flex gap-4">
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-travelTeal transition-colors" href="#">FB</a>
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-travelTeal transition-colors" href="#">IG</a>
              <a className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-travelTeal transition-colors" href="#">TW</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-white/60">
              <li><a className="hover:text-white transition-colors" href="#">Health Tracking</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Travel Planning</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Shared Gallery</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Premium Features</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-white/60">
              <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Our Mission</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Stay Updated</h4>
            <p className="text-white/60 mb-4 text-sm">Get travel tips and wellness advice in your inbox.</p>
            <form className="flex gap-2">
              <input 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full focus:outline-none focus:border-travelTeal text-white placeholder:text-white/40" 
                placeholder="Email address" 
                type="email"
              />
              <button 
                className="w-14 h-10 bg-wellnessPink rounded-xl flex items-center justify-center hover:scale-105 transition-all text-white"
                type="submit"
                aria-label="Subscribe"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© 2024 Wellness & Travel Adventure Hub. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
