import { Link } from 'react-router-dom';
import { Plane, Mail, Phone, MapPin, Heart, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative bg-[#06070a] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center"><Plane className="w-4 h-4 text-white -rotate-45" /></div>
              <span className="text-lg font-bold text-white">VoyageWise</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">Smart travel companion for budget-friendly journeys across India. Compare flights, trains & buses.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigate</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              {[['/','Home'],['/search','Search'],['/popular','Routes'],['/user/login','Sign In']].map(([p,l]) => (
                <li key={p}><Link to={p} className="hover:text-sky-400 transition">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Travel</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li>✈️ Domestic Flights</li>
              <li>🚂 Indian Railways</li>
              <li>🚌 Bus Services</li>
              <li>🗺️ 45+ Cities</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2.5 text-sm text-white/40">
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> support@voyagewise.in</li>
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +91 1800-XXX-XXXX</li>
              <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> New Delhi, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs flex items-center">Made with <Heart className="w-3 h-3 text-red-500 mx-1" /> in India • © 2024 VoyageWise</p>
          <div className="flex gap-4 text-xs text-white/30"><a href="#" className="hover:text-white/60">Privacy</a><a href="#" className="hover:text-white/60">Terms</a></div>
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-white/20 transition z-40">
        <ArrowUp className="w-4 h-4 text-white" />
      </motion.button>
    </footer>
  );
}
