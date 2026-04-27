import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, CheckCircle, Sparkles, Users, TrendingUp, Award, Zap, Shield, Heart, Globe, IndianRupee, Clock } from 'lucide-react';
import { CITIES } from '../data/cities';
import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const nav = useNavigate();
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [budget, setBudget] = useState('');
  const [srcList, setSrcList] = useState(false);
  const [dstList, setDstList] = useState(false);
  const srcRef = useRef<HTMLDivElement>(null);
  const dstRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  const heroOp = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (srcRef.current && !srcRef.current.contains(e.target as Node)) setSrcList(false);
      if (dstRef.current && !dstRef.current.contains(e.target as Node)) setDstList(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const filterCities = (q: string) => q.length < 2 ? [] : CITIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.state.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  const popular = CITIES.filter(c => c.popular).slice(0, 8);

  const handleSearch = () => {
    const s = CITIES.find(c => c.name.toLowerCase() === src.toLowerCase());
    const d = CITIES.find(c => c.name.toLowerCase() === dst.toLowerCase());
    if (s && d && budget) nav(`/search?source=${s.name}&destination=${d.name}&budget=${budget}&date=${new Date().toISOString().split('T')[0]}&passengers=1`);
  };

  return (
    <div className="min-h-screen bg-[#06070a]">
      {/* ────────── HERO ────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ x: [0, 80, 0], y: [0, -60, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
          <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
          <motion.div animate={{ x: [0, 40, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px]" />
          {/* Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          {/* Floating vehicles */}
          <motion.div animate={{ x: ['-5%', '105%'], y: [0, -20, 10, -15, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute top-[15%] text-4xl opacity-15">✈️</motion.div>
          <motion.div animate={{ x: ['105%', '-5%'] }} transition={{ duration: 35, repeat: Infinity, ease: 'linear', delay: 5 }} className="absolute top-[35%] text-3xl opacity-10">🚂</motion.div>
          <motion.div animate={{ x: ['-5%', '105%'] }} transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 10 }} className="absolute top-[55%] text-2xl opacity-[0.06]">🚌</motion.div>
        </div>

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-bright mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white/80 text-xs font-medium tracking-wide">India's #1 Smart Budget Travel Platform</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8, ease: [0.22,1,0.36,1] }} className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
            Discover Your<br />
            <span className="grad-text">Perfect Journey</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed">
            Compare flights, trains & buses across 45+ Indian cities.<br className="hidden sm:block" />
            Get the most budget-friendly options — instantly.
          </motion.p>

          {/* ── Search Card ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8, ease: [0.22,1,0.36,1] }} className="max-w-4xl mx-auto persp">
            <motion.div whileHover={{ rotateX: 2, rotateY: -1 }} transition={{ type: 'spring', stiffness: 200 }} className="preserve3d glass rounded-3xl p-6 sm:p-8 glow-ring">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
                {/* From */}
                <div ref={srcRef} className="relative lg:col-span-1">
                  <label className="text-[11px] uppercase tracking-wider text-sky-400/80 font-semibold mb-1.5 block">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400/50" />
                    <input value={src} onChange={e => { setSrc(e.target.value); setSrcList(true); }} onFocus={() => setSrcList(true)} placeholder="Source city" className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20 transition" />
                  </div>
                  {srcList && filterCities(src).length > 0 && (
                    <div className="absolute z-30 mt-1 w-full glass rounded-xl overflow-hidden shadow-2xl">
                      {filterCities(src).map(c => (
                        <button key={c.code} onMouseDown={e => e.preventDefault()} onClick={() => { setSrc(c.name); setSrcList(false); }} className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm text-white/80 transition"><b className="text-white">{c.name}</b><span className="text-white/30 ml-2 text-xs">{c.state}</span></button>
                      ))}
                    </div>
                  )}
                </div>
                {/* To */}
                <div ref={dstRef} className="relative lg:col-span-1">
                  <label className="text-[11px] uppercase tracking-wider text-amber-400/80 font-semibold mb-1.5 block">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
                    <input value={dst} onChange={e => { setDst(e.target.value); setDstList(true); }} onFocus={() => setDstList(true)} placeholder="Destination" className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-amber-400/50 outline-none text-sm text-white placeholder-white/20 transition" />
                  </div>
                  {dstList && filterCities(dst).length > 0 && (
                    <div className="absolute z-30 mt-1 w-full glass rounded-xl overflow-hidden shadow-2xl">
                      {filterCities(dst).map(c => (
                        <button key={c.code} onMouseDown={e => e.preventDefault()} onClick={() => { setDst(c.name); setDstList(false); }} className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm text-white/80 transition"><b className="text-white">{c.name}</b><span className="text-white/30 ml-2 text-xs">{c.state}</span></button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Budget */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-emerald-400/80 font-semibold mb-1.5 block">Budget (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="5000" className="w-full pl-9 pr-3 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-emerald-400/50 outline-none text-sm text-white placeholder-white/20 transition" />
                  </div>
                </div>
                {/* Date */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-violet-400/80 font-semibold mb-1.5 block">Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-violet-400/50 outline-none text-sm text-white/80 transition [color-scheme:dark]" />
                </div>
                {/* Search btn */}
                <div className="flex items-end">
                  <button onClick={handleSearch} className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition-all active:scale-[0.98]">
                    <Search className="w-4 h-4" /> Search
                  </button>
                </div>
              </div>
              {/* Popular chips */}
              <div className="pt-4 border-t border-white/[0.06]">
                <p className="text-[11px] text-white/30 mb-2 uppercase tracking-wider">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {popular.map(c => (
                    <button key={c.code} onClick={() => setDst(c.name)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/50 text-xs font-medium hover:bg-white/10 hover:text-white transition border border-white/[0.06]">{c.name}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#06070a] to-transparent" />
      </section>

      {/* ────────── STATS ────────── */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Users className="w-6 h-6" />, val: '50K+', label: 'Travelers', color: 'from-blue-500 to-sky-400' },
              { icon: <MapPin className="w-6 h-6" />, val: '45+', label: 'Cities', color: 'from-emerald-500 to-teal-400' },
              { icon: <TrendingUp className="w-6 h-6" />, val: '₹5Cr+', label: 'Saved', color: 'from-amber-500 to-yellow-400' },
              { icon: <Award className="w-6 h-6" />, val: '4.9★', label: 'Rating', color: 'from-violet-500 to-purple-400' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22,1,0.36,1] }} whileHover={{ y: -8, rotateX: 5 }} className="persp">
                <div className="preserve3d glass rounded-2xl p-6 text-center group hover:glow-ring transition-all">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>{s.icon}</div>
                  <p className="text-3xl font-bold text-white">{s.val}</p>
                  <p className="text-xs text-white/40 mt-1">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── TRANSPORT CARDS ────────── */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sky-400 text-xs font-semibold uppercase tracking-widest">Compare Everything</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-tight">All Travel Modes<br /><span className="grad-text">One Platform</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '✈️', title: 'Flights', desc: '8 airlines • 45+ airports • 2-4 hours', price: '₹2,200+', color: 'from-blue-600/20 to-blue-900/20', border: 'border-blue-500/20', items: ['IndiGo, Air India, Vistara...', 'Economy to Business', 'Instant booking', 'Meal & baggage included'] },
              { emoji: '🚂', title: 'Trains', desc: '12 train types • 7 classes • 4-36 hours', price: '₹50+', color: 'from-emerald-600/20 to-emerald-900/20', border: 'border-emerald-500/20', items: ['Rajdhani, Vande Bharat...', 'General to 1A First Class', 'Pantry car & bedding', 'IRCTC integration'] },
              { emoji: '🚌', title: 'Buses', desc: '10 types • 18 operators • 3-24 hours', price: '₹150+', color: 'from-amber-600/20 to-amber-900/20', border: 'border-amber-500/20', items: ['Volvo, Mercedes, Sleeper...', 'AC & Non-AC options', 'USB charging & blanket', 'Door-to-door service'] },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.7, ease: [0.22,1,0.36,1] }} whileHover={{ y: -12, rotateX: 5, rotateY: i === 0 ? 5 : i === 2 ? -5 : 0 }} className="persp">
                <div className={`preserve3d glass rounded-3xl p-7 border ${t.border} hover:glow-ring transition-all h-full`}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }} className="text-5xl mb-5">{t.emoji}</motion.div>
                  <h3 className="text-2xl font-bold text-white mb-1">{t.title}</h3>
                  <p className="text-white/40 text-sm mb-4">{t.desc}</p>
                  <div className="glass-bright rounded-xl px-4 py-2 inline-block mb-4">
                    <span className="text-white/50 text-xs">From </span><span className="text-white font-bold">{t.price}</span>
                  </div>
                  <ul className="space-y-2">
                    {t.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-white/50"><CheckCircle className="w-3.5 h-3.5 text-sky-400/60 flex-shrink-0" />{item}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── FEATURES ────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-sky-400 text-xs font-semibold uppercase tracking-widest">Why VoyageWise</span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 tracking-tight">Built for <span className="grad-text">Smart Travelers</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Zap className="w-5 h-5" />, title: 'Instant Compare', desc: 'Real-time pricing across all modes in seconds', c: 'from-amber-500 to-orange-500' },
              { icon: <IndianRupee className="w-5 h-5" />, title: 'Budget First', desc: 'Enter budget, get personalized recommendations', c: 'from-emerald-500 to-teal-500' },
              { icon: <Globe className="w-5 h-5" />, title: '45+ Cities', desc: 'Full India coverage with GPS route mapping', c: 'from-blue-500 to-indigo-500' },
              { icon: <Shield className="w-5 h-5" />, title: 'Secure & Private', desc: 'Your data encrypted, never shared', c: 'from-violet-500 to-purple-500' },
              { icon: <Clock className="w-5 h-5" />, title: 'Time Saved', desc: 'No more switching apps — everything here', c: 'from-rose-500 to-pink-500' },
              { icon: <Heart className="w-5 h-5" />, title: 'Smart Tips', desc: 'AI picks: cheapest, fastest, greenest, best value', c: 'from-cyan-500 to-sky-500' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -5, scale: 1.02 }} className="glass rounded-2xl p-6 group hover:glow-ring transition-all">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.c} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-white font-bold mb-1.5">{f.title}</h3>
                <p className="text-sm text-white/40">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Ready to Travel<br /><span className="grad-text">Smarter?</span></h2>
            <p className="text-white/40 text-lg mb-8">Join 50,000+ travelers saving money every day</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/search" className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold hover:shadow-lg hover:shadow-sky-500/20 transition flex items-center gap-2"><Search className="w-5 h-5" /> Start Searching</Link>
              <Link to="/user/register" className="px-8 py-3.5 rounded-xl glass-bright text-white font-bold hover:bg-white/15 transition">Sign Up Free</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
