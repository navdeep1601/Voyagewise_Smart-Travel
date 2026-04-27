import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Plane, Train, Bus } from 'lucide-react';

const ROUTES = [
  { src: 'Delhi', dst: 'Mumbai', dist: 1400, f: '2h 15m', t: '16h', b: '24h' },
  { src: 'Delhi', dst: 'Goa', dist: 1900, f: '2h 45m', t: '26h', b: '30h' },
  { src: 'Mumbai', dst: 'Goa', dist: 600, f: '1h 10m', t: '12h', b: '10h' },
  { src: 'Delhi', dst: 'Jaipur', dist: 280, f: '1h', t: '4h 30m', b: '5h' },
  { src: 'Bangalore', dst: 'Goa', dist: 560, f: '1h 15m', t: '12h', b: '10h' },
  { src: 'Chennai', dst: 'Bangalore', dist: 350, f: '1h', t: '5h', b: '6h' },
  { src: 'Kolkata', dst: 'Delhi', dist: 1500, f: '2h 20m', t: '17h', b: '24h' },
  { src: 'Delhi', dst: 'Shimla', dist: 350, f: '1h', t: '10h', b: '7h' },
  { src: 'Delhi', dst: 'Manali', dist: 540, f: '1h 30m', t: '12h', b: '12h' },
  { src: 'Mumbai', dst: 'Jaipur', dist: 1150, f: '2h', t: '18h', b: '16h' },
  { src: 'Delhi', dst: 'Varanasi', dist: 820, f: '1h 30m', t: '8h', b: '12h' },
  { src: 'Hyderabad', dst: 'Goa', dist: 660, f: '1h 15m', t: '14h', b: '12h' },
  { src: 'Delhi', dst: 'Udaipur', dist: 660, f: '1h 20m', t: '12h', b: '10h' },
  { src: 'Bangalore', dst: 'Kochi', dist: 510, f: '1h', t: '11h', b: '10h' },
  { src: 'Delhi', dst: 'Amritsar', dist: 450, f: '1h', t: '6h', b: '8h' },
  { src: 'Mumbai', dst: 'Kolkata', dist: 2000, f: '2h 50m', t: '26h', b: '30h' },
  { src: 'Delhi', dst: 'Leh', dist: 1000, f: '1h 20m', t: '—', b: '—' },
  { src: 'Delhi', dst: 'Srinagar', dist: 850, f: '1h 30m', t: '—', b: '24h' },
  { src: 'Chennai', dst: 'Kochi', dist: 680, f: '1h 15m', t: '12h', b: '14h' },
  { src: 'Kolkata', dst: 'Darjeeling', dist: 620, f: '1h', t: '10h', b: '12h' },
  { src: 'Delhi', dst: 'Agra', dist: 230, f: '—', t: '2h', b: '4h' },
  { src: 'Delhi', dst: 'Rishikesh', dist: 250, f: '—', t: '5h', b: '6h' },
  { src: 'Bangalore', dst: 'Mysore', dist: 150, f: '—', t: '2h 30m', b: '3h' },
  { src: 'Mumbai', dst: 'Udaipur', dist: 800, f: '1h 30m', t: '14h', b: '12h' },
];

const today = new Date().toISOString().split('T')[0];

export default function PopularRoutes() {
  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-sky-400 text-xs font-semibold uppercase tracking-widest">Explore India</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-tight">Popular <span className="grad-text">Routes</span></h1>
          <p className="text-white/40 mt-3 max-w-xl mx-auto">Most searched travel routes with estimated times across all modes</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROUTES.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} whileHover={{ y: -4, scale: 1.01 }}>
              <Link to={`/search?source=${r.src}&destination=${r.dst}&budget=10000&date=${today}&passengers=1`} className="block glass rounded-2xl p-5 border border-white/[0.06] hover:border-white/15 hover:glow-ring transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-sky-400" /></div>
                    <div><p className="font-bold text-white">{r.src}</p><p className="text-[10px] text-white/30">{r.dist} km</p></div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-sky-400 transition" />
                  <div className="flex items-center gap-3">
                    <div className="text-right"><p className="font-bold text-white">{r.dst}</p><p className="text-[10px] text-white/30">Explore →</p></div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-amber-400" /></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {r.f !== '—' && <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-medium flex items-center gap-1"><Plane className="w-3 h-3" />{r.f}</span>}
                  {r.t !== '—' && <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-medium flex items-center gap-1"><Train className="w-3 h-3" />{r.t}</span>}
                  {r.b !== '—' && <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-medium flex items-center gap-1"><Bus className="w-3 h-3" />{r.b}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
