import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, Bus, Search, MapPin, Calendar, Users, IndianRupee, Star, Leaf, Clock, ChevronRight, Award, Filter, ArrowUpDown, Loader2, Navigation, TrendingDown, Sparkles } from 'lucide-react';
import { CITIES } from '../data/cities';
import { generateOptions, getRecommendations, TravelOption } from '../data/pricing';
import { saveSearch, getSession } from '../store/auth';

type SortKey = 'price' | 'duration' | 'rating';
type FilterType = 'all' | 'flight' | 'train' | 'bus';

/* ─── Static color maps (Tailwind can't purge dynamic strings) ─── */
const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; badgeBg: string; badgeText: string }> = {
  flight: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', badgeBg: 'bg-blue-500/10', badgeText: 'text-blue-400' },
  train:  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-400' },
  bus:    { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-400' },
};

const REC_STYLES: Record<string, { badgeBg: string; badgeText: string }> = {
  emerald: { badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-400' },
  sky:     { badgeBg: 'bg-sky-500/15', badgeText: 'text-sky-400' },
  amber:   { badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-400' },
  teal:    { badgeBg: 'bg-teal-500/15', badgeText: 'text-teal-400' },
};

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [src, setSrc] = useState(params.get('source') || '');
  const [dst, setDst] = useState(params.get('destination') || '');
  const [budget, setBudget] = useState(params.get('budget') || '');
  const [date, setDate] = useState(params.get('date') || new Date().toISOString().split('T')[0]);
  const [pax, setPax] = useState(Number(params.get('passengers')) || 1);
  const [results, setResults] = useState<TravelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [srcList, setSrcList] = useState(false);
  const [dstList, setDstList] = useState(false);

  const srcCity = useMemo(() => CITIES.find(c => c.name.toLowerCase() === src.toLowerCase()), [src]);
  const dstCity = useMemo(() => CITIES.find(c => c.name.toLowerCase() === dst.toLowerCase()), [dst]);

  const doSearch = () => {
    if (!srcCity || !dstCity || !budget) return;
    setLoading(true); setSearched(true);
    setTimeout(() => {
      const opts = generateOptions(srcCity, dstCity, Number(budget));
      setResults(opts); setLoading(false);
      saveSearch({ source: src, destination: dst, budget: Number(budget), date, passengers: pax, resultCount: opts.length, time: new Date().toISOString() });
      setPriceRange([0, Math.max(...opts.map(o => o.price), 1000)]);
    }, 900);
  };

  useEffect(() => { if (srcCity && dstCity && budget) doSearch(); }, []);

  const filtered = useMemo(() => {
    let list = [...results];
    if (filterType !== 'all') list = list.filter(o => o.type === filterType);
    list = list.filter(o => o.price >= priceRange[0] && o.price <= priceRange[1]);
    list.sort((a, b) => sortBy === 'price' ? a.price - b.price : sortBy === 'rating' ? b.rating - a.rating : parseFloat(a.duration) - parseFloat(b.duration));
    return list;
  }, [results, sortBy, filterType, priceRange]);

  const recs = useMemo(() => results.length ? getRecommendations(results, Number(budget)) : null, [results, budget]);

  const filterCities = (q: string) => q.length < 2 ? [] : CITIES.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.state.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  const tIcon = (t: string) => t === 'flight' ? <Plane className="w-4 h-4" /> : t === 'train' ? <Train className="w-4 h-4" /> : <Bus className="w-4 h-4" />;

  const handleBook = (opt: TravelOption) => {
    // Stash chosen option in sessionStorage so the booking page can pick it up
    sessionStorage.setItem('vw_pending_booking', JSON.stringify({
      option: opt,
      journeyDate: date,
      passengers: pax,
    }));
    const session = getSession();
    if (!session || session.role !== 'user') {
      // Send unauthenticated users to login; they'll come back via /book.
      navigate('/user/login?redirect=/book');
    } else {
      navigate('/book');
    }
  };

  // Count by type for the summary
  const counts = useMemo(() => {
    const c = { flight: 0, train: 0, bus: 0 };
    filtered.forEach(o => c[o.type]++);
    return c;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5 mb-8 glow-ring">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[{ l: 'From', v: src, set: (x: string) => { setSrc(x); setSrcList(true); }, show: srcList, setShow: setSrcList },
              { l: 'To', v: dst, set: (x: string) => { setDst(x); setDstList(true); }, show: dstList, setShow: setDstList }
            ].map((f, i) => (
              <div key={i} className="relative col-span-2 sm:col-span-1">
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block"><MapPin className="w-3 h-3 inline mr-1" />{f.l}</label>
                <input value={f.v} onChange={e => f.set(e.target.value)} onFocus={() => f.setShow(true)} onBlur={() => setTimeout(() => f.setShow(false), 200)} placeholder={f.l === 'From' ? 'Source' : 'Destination'} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" />
                {f.show && filterCities(f.v).length > 0 && (
                  <div className="absolute z-30 mt-1 w-full glass rounded-xl overflow-hidden shadow-2xl">
                    {filterCities(f.v).map(c => <button key={c.code} onMouseDown={e => e.preventDefault()} onClick={() => { f.set(c.name); f.setShow(false); }} className="w-full text-left px-3 py-2 hover:bg-white/10 text-sm text-white/80"><b className="text-white">{c.name}</b><span className="text-white/30 ml-1 text-xs">{c.state}</span></button>)}
                  </div>
                )}
              </div>
            ))}
            <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block"><IndianRupee className="w-3 h-3 inline mr-1" />Budget</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="₹5000" className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block"><Calendar className="w-3 h-3 inline mr-1" />Date</label><input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 outline-none text-sm text-white/70 [color-scheme:dark]" /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block"><Users className="w-3 h-3 inline mr-1" />Pax</label><select value={pax} onChange={e => setPax(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 outline-none text-sm text-white/70 [color-scheme:dark]">{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div className="flex items-end"><button onClick={doSearch} disabled={loading || !srcCity || !dstCity || !budget} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition disabled:opacity-40">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search</button></div>
          </div>
        </motion.div>

        {/* Recommendations */}
        {recs && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Smart Picks for ₹{Number(budget).toLocaleString()}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '💰 Cheapest', opt: recs.cheapest, accent: 'emerald' },
                { label: '⭐ Best Value', opt: recs.bestValue, accent: 'sky' },
                { label: '⚡ Fastest', opt: recs.fastest, accent: 'amber' },
                { label: '🌿 Greenest', opt: recs.greenest, accent: 'teal' },
              ].map((r, i) => r.opt && (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5, rotateX: 3 }} className="persp">
                  <div className="preserve3d glass rounded-2xl p-4 border border-white/[0.08] hover:border-white/20 transition-all relative overflow-hidden">
                    <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl ${REC_STYLES[r.accent]?.badgeBg || 'bg-sky-500/15'} ${REC_STYLES[r.accent]?.badgeText || 'text-sky-400'} text-[10px] font-bold uppercase tracking-wider`}>{r.label}</div>
                    <div className="flex items-center gap-2 mb-3 mt-3">
                      <div className={`w-8 h-8 rounded-lg ${TYPE_STYLES[r.opt!.type].bg} flex items-center justify-center ${TYPE_STYLES[r.opt!.type].text}`}>{tIcon(r.opt!.type)}</div>
                      <div><p className="text-xs text-white/70 font-medium">{r.opt!.carrier}</p><p className="text-[10px] text-white/30">{r.opt!.travelClass}</p></div>
                    </div>
                    <p className="text-2xl font-bold text-white">₹{r.opt!.price.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 mb-2">per person</p>
                    <div className="flex items-center gap-2 text-xs text-white/40"><Clock className="w-3 h-3" />{r.opt!.duration}<span className="text-white/20">•</span>{r.opt!.departure}→{r.opt!.arrival}</div>
                    {r.opt!.discount > 0 && <div className="mt-2 text-emerald-400 text-xs font-medium flex items-center gap-1"><TrendingDown className="w-3 h-3" />{r.opt!.discount}% OFF</div>}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-3">{recs.totalOptions} options within your ₹{Number(budget).toLocaleString()} budget</p>
          </motion.div>
        )}

        {/* Filters & counts */}
        {results.length > 0 && !loading && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              {([['all','All'],['flight','✈️ Flights'],['train','🚂 Trains'],['bus','🚌 Buses']] as [FilterType,string][]).map(([t,l]) => (
                <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filterType === t ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-white/40 hover:text-white/70'}`}>{l}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 glass rounded-xl p-1">
              {([['price','Price'],['duration','Duration'],['rating','Rating']] as [SortKey,string][]).map(([k,l]) => (
                <button key={k} onClick={() => setSortBy(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${sortBy === k ? 'bg-sky-500/20 text-sky-400' : 'text-white/40 hover:text-white/70'}`}><ArrowUpDown className="w-3 h-3" />{l}</button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-1.5 rounded-xl glass text-xs font-medium text-white/50 hover:text-white/80 flex items-center gap-1"><Filter className="w-3 h-3" />Filters</button>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-white/30">
              <span>✈️ {counts.flight}</span><span>🚂 {counts.train}</span><span>🚌 {counts.bus}</span>
              <span className="text-white/50 font-medium">| {filtered.length} total</span>
            </div>
          </div>
        )}

        {/* Price range */}
        <AnimatePresence>{showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass rounded-xl p-4 mb-6 overflow-hidden">
            <label className="text-xs text-white/50 mb-2 block">₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}</label>
            <div className="flex gap-4"><input type="range" min={0} max={Math.max(...results.map(r => r.price), 1000)} value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} className="flex-1" /><input type="range" min={0} max={Math.max(...results.map(r => r.price), 1000)} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} className="flex-1" /></div>
          </motion.div>
        )}</AnimatePresence>

        {/* Loading */}
        {loading && <div className="text-center py-20"><motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-sky-500/20 border-t-sky-400" /><p className="text-white/70 font-medium">Searching {src} → {dst}</p><p className="text-sm text-white/30 mt-1">Comparing flights, trains & buses...</p></div>}

        {/* Results */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map((opt, i) => {
              const isBest = recs?.bestValue?.id === opt.id;
              const st = TYPE_STYLES[opt.type];
              return (
                <motion.div key={opt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.6) }} whileHover={{ y: -3, scale: 1.005 }} className={`glass rounded-2xl overflow-hidden transition-all ${isBest ? 'border-sky-500/30 glow-ring' : 'border-white/[0.06] hover:border-white/15'}`}>
                  {isBest && <div className="bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-center py-1.5 text-xs font-bold text-sky-400 flex items-center justify-center gap-1 border-b border-white/[0.06]"><Award className="w-3.5 h-3.5" /> BEST VALUE</div>}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Carrier */}
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className={`w-11 h-11 rounded-xl ${st.bg} flex items-center justify-center ${st.text}`}>{tIcon(opt.type)}</div>
                        <div>
                          <p className="font-semibold text-white text-sm">{opt.carrier}</p>
                          <p className="text-[10px] text-white/40">{opt.travelClass}</p>
                          <div className="flex items-center gap-1 mt-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[10px] text-white/50">{opt.rating.toFixed(1)}</span></div>
                        </div>
                      </div>
                      {/* Journey */}
                      <div className="flex-1 flex items-center gap-3">
                        <div className="text-center min-w-[55px]"><p className="text-xl font-bold text-white">{opt.departure}</p><p className="text-[10px] text-white/30">{opt.source}</p></div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center gap-1 text-[10px] text-white/30 mb-1"><Clock className="w-3 h-3" />{opt.duration}</div>
                          <div className="w-full h-[2px] bg-white/[0.06] rounded-full relative"><div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30" /><div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" /></div>
                          <p className="text-[10px] mt-1">{opt.stops === 0 ? <span className="text-emerald-400 font-medium">Direct</span> : <span className="text-amber-400">{opt.stops} stop{opt.stops>1?'s':''}</span>}</p>
                        </div>
                        <div className="text-center min-w-[55px]"><p className="text-xl font-bold text-white">{opt.arrival}</p><p className="text-[10px] text-white/30">{opt.destination}</p></div>
                      </div>
                      {/* Price */}
                      <div className="text-right min-w-[110px]">
                        {opt.discount > 0 && <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">{opt.discount}% OFF</span>}
                        <p className="text-2xl font-bold text-white mt-1">₹{opt.price.toLocaleString()}</p>
                        <p className="text-[10px] text-white/30">per person</p>
                        <div className="flex items-center gap-1 mt-1 justify-end text-[10px] text-white/30"><Leaf className="w-3 h-3 text-emerald-400/60" />{opt.co2}kg CO₂</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                      {opt.amenities.slice(0, 4).map((a, j) => <span key={j} className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-white/30">{a}</span>)}
                      <span className="ml-auto text-[10px] text-white/20">{opt.seats} seats left</span>
                      <button onClick={() => handleBook(opt)} className="px-4 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 text-xs font-semibold hover:bg-sky-500/20 transition flex items-center gap-1">Book <ChevronRight className="w-3 h-3" /></button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty states */}
        {!loading && searched && filtered.length === 0 && results.length > 0 && <div className="text-center py-16"><Filter className="w-10 h-10 text-white/20 mx-auto mb-3" /><p className="text-white/40 font-medium">No options match filters</p><button onClick={() => { setFilterType('all'); setPriceRange([0, 100000]); }} className="mt-3 text-sky-400 text-sm">Reset</button></div>}
        {!loading && searched && results.length === 0 && <div className="text-center py-16"><Search className="w-10 h-10 text-white/20 mx-auto mb-3" /><p className="text-white/40 font-medium">No travel options found</p><p className="text-sm text-white/20 mt-1">Try increasing budget or changing route</p></div>}
        {!searched && !loading && <div className="text-center py-20"><Navigation className="w-14 h-14 text-white/10 mx-auto mb-4" /><p className="text-white/40 font-medium">Enter travel details above</p><p className="text-sm text-white/20 mt-1">We'll find the best budget options for you</p></div>}
      </div>
    </div>
  );
}
