import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  Plane, Train, Bus, ArrowLeft, ArrowRight, Plus, Minus, User, Calendar, Clock,
  MapPin, IndianRupee, CreditCard, Smartphone, Lock, ShieldCheck, CheckCircle2,
  AlertCircle, Loader2, Sparkles, Copy, Info,
} from 'lucide-react';
import type { TravelOption } from '../data/pricing';
import {
  getCurrentUser, saveTicket, type Passenger, type PaymentMethod, type Ticket,
} from '../store/auth';

interface PendingBooking {
  option: TravelOption;
  journeyDate: string;
  passengers: number;
}

const TYPE_META: Record<TravelOption['type'], { icon: React.ReactNode; label: string; color: string }> = {
  flight: { icon: <Plane className="w-5 h-5" />, label: 'Flight', color: 'from-blue-500 to-sky-400' },
  train:  { icon: <Train  className="w-5 h-5" />, label: 'Train',  color: 'from-emerald-500 to-teal-400' },
  bus:    { icon: <Bus    className="w-5 h-5" />, label: 'Bus',    color: 'from-amber-500 to-yellow-400' },
};

// Convenience fee (demo): 2% of base, capped
function calcConvenience(base: number) {
  return Math.min(Math.max(Math.round(base * 0.02), 25), 199);
}
function calcGst(base: number) {
  return Math.round(base * 0.05);
}

export default function BookingPage() {
  const nav = useNavigate();
  const user = getCurrentUser();
  const [pending, setPending] = useState<PendingBooking | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [passengers, setPassengers] = useState<Passenger[]>([{ name: '', age: 0 }]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<Ticket | null>(null);

  // Load pending booking from session storage and prefill contact
  useEffect(() => {
    if (!user) {
      nav('/user/login?redirect=/book');
      return;
    }
    const raw = sessionStorage.getItem('vw_pending_booking');
    if (!raw) {
      nav('/search');
      return;
    }
    try {
      const data = JSON.parse(raw) as PendingBooking;
      setPending(data);
      const count = Math.max(1, Math.min(6, data.passengers || 1));
      setPassengers(prev => {
        const out: Passenger[] = [];
        for (let i = 0; i < count; i++) out.push(prev[i] || { name: '', age: 0 });
        // Prefill the first passenger with the user's name
        if (user && !out[0].name) out[0] = { name: user.name, age: out[0].age || 0 };
        return out;
      });
      setContactEmail(user.email);
      setContactPhone(user.phone);
    } catch {
      nav('/search');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opt = pending?.option;
  const journeyDate = pending?.journeyDate || '';

  const subtotal = opt ? opt.price * passengers.length : 0;
  const convenience = calcConvenience(subtotal);
  const gst = calcGst(subtotal);
  const total = subtotal + convenience + gst;

  // Generate UPI QR whenever needed
  useEffect(() => {
    if (step !== 2 || payMethod !== 'upi' || !opt) return;
    const purpose = `VoyageWise ${opt.carrier} ${opt.source}-${opt.destination}`.replace(/[^a-zA-Z0-9 \-]/g, '').slice(0, 60);
    const uri = `upi://pay?pa=voyagewise@upi&pn=VoyageWise%20Travel&am=${total}&cu=INR&tn=${encodeURIComponent(purpose)}`;
    QRCode.toDataURL(uri, { width: 280, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [step, payMethod, opt, total]);

  // ── Validation (memos must run on every render — no early returns above this) ──
  const cardValid = useMemo(() => {
    const num = card.number.replace(/\s+/g, '');
    return /^\d{12,19}$/.test(num) &&
      /^[A-Za-z .'-]{2,}$/.test(card.name) &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry) &&
      /^\d{3,4}$/.test(card.cvv);
  }, [card]);

  const meta = opt ? TYPE_META[opt.type] : null;

  if (!user || !opt || !pending || !meta) {
    return (
      <div className="min-h-screen bg-[#06070a] pt-32 text-center text-white/40">
        Loading booking...
      </div>
    );
  }

  const passengersValid = passengers.every(p => p.name.trim().length >= 2 && p.age >= 1 && p.age <= 120);
  const contactValid = /^\S+@\S+\.\S+$/.test(contactEmail) && /^[6-9]\d{9}$/.test(contactPhone);
  const upiValid = /^[\w.\-]{2,}@[\w]{2,}$/.test(upiId);
  const paymentValid = payMethod === 'card' ? cardValid : upiValid;

  // ── Actions ──
  const updatePassengerCount = (delta: number) => {
    setPassengers(prev => {
      const next = [...prev];
      if (delta > 0 && next.length < 6) next.push({ name: '', age: 0 });
      if (delta < 0 && next.length > 1) next.pop();
      return next;
    });
  };

  const updatePassenger = (i: number, patch: Partial<Passenger>) => {
    setPassengers(prev => prev.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  };

  const handleNextFromStep1 = () => {
    setError('');
    if (!passengersValid) { setError('Please enter a valid name and age (1–120) for every passenger.'); return; }
    if (!contactValid)    { setError('Please enter a valid contact email and 10-digit phone.'); return; }
    setStep(2);
  };

  const handlePay = async () => {
    setError('');
    if (!paymentValid) {
      setError(payMethod === 'card' ? 'Please enter complete and valid card details.' : 'Please enter a valid UPI ID (e.g. name@bank).');
      return;
    }
    setProcessing(true);
    // Simulate gateway latency — this is a DEMO, no real gateway involved.
    await new Promise(r => setTimeout(r, 1600));
    const paymentRef = payMethod === 'card'
      ? `XXXX-XXXX-XXXX-${card.number.replace(/\s+/g, '').slice(-4)}`
      : upiId;
    const ticket = saveTicket({
      userId: user.id,
      option: opt,
      passengers,
      journeyDate,
      paymentMethod: payMethod,
      paymentRef,
      totalAmount: total,
    });
    sessionStorage.removeItem('vw_pending_booking');
    setConfirmed(ticket);
    setStep(3);
    setProcessing(false);
  };

  // ── STEP 3: Confirmation ──
  if (step === 3 && confirmed) {
    return (
      <div className="min-h-screen bg-[#06070a] pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass rounded-3xl glow-ring p-8 text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-white/50 text-sm">Your ticket has been added to your account.</p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="glass-bright rounded-xl p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">PNR / Booking ID</p>
                <p className="font-mono text-lg text-white tracking-wider">{confirmed.pnr}</p>
              </div>
              <div className="glass-bright rounded-xl p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Amount Paid</p>
                <p className="text-lg font-bold text-emerald-400">₹{confirmed.totalAmount.toLocaleString()}</p>
              </div>
              <div className="glass-bright rounded-xl p-3 col-span-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Journey</p>
                <p className="text-white text-sm font-medium">
                  {opt.source} → {opt.destination} • {new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {opt.carrier} ({opt.travelClass}) • {opt.departure} → {opt.arrival}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={() => nav(`/ticket/${confirmed.id}`)}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition">
                View Ticket <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => nav('/user/dashboard')}
                className="flex-1 px-5 py-3 rounded-xl glass-bright text-white font-medium text-sm hover:bg-white/15 transition">
                Go to Dashboard
              </button>
            </div>

            <p className="mt-6 text-[10px] text-white/30 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" />
              Tickets are auto-removed from your account after the journey date passes.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => step === 1 ? nav(-1) : setStep((step - 1) as 1 | 2)}
          className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Back to results' : 'Back'}
        </button>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[
            { n: 1, l: 'Passengers' },
            { n: 2, l: 'Payment' },
            { n: 3, l: 'Confirm' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition
                ${step >= s.n ? 'bg-gradient-to-br from-sky-400 to-indigo-500 text-white' : 'bg-white/5 text-white/30'}`}>
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs font-medium ${step >= s.n ? 'text-white' : 'text-white/30'}`}>{s.l}</span>
              {i < 2 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <AnimatePresence mode="wait">
              {/* STEP 1 — Passenger details */}
              {step === 1 && (
                <motion.div
                  key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white flex items-center gap-2"><User className="w-4 h-4 text-sky-400" /> Passenger Details</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updatePassengerCount(-1)}
                        disabled={passengers.length <= 1}
                        className="w-7 h-7 rounded-lg glass-bright flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-white text-sm font-medium w-6 text-center">{passengers.length}</span>
                      <button onClick={() => updatePassengerCount(1)}
                        disabled={passengers.length >= 6}
                        className="w-7 h-7 rounded-lg glass-bright flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {passengers.map((p, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Passenger {i + 1} Name</label>
                          <input value={p.name} onChange={e => updatePassenger(i, { name: e.target.value })} placeholder="As per government ID"
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Age</label>
                          <input type="number" min={1} max={120} value={p.age || ''} onChange={e => updatePassenger(i, { age: Number(e.target.value) })}
                            placeholder="Years"
                            className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 className="font-semibold text-white flex items-center gap-2 mt-6 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Contact Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Email</label>
                      <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Phone</label>
                      <input value={contactPhone} onChange={e => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white" />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}

                  <button onClick={handleNextFromStep1}
                    className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition">
                    Continue to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <motion.div
                  key="s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-5"
                >
                  <div className="glass rounded-2xl p-5">
                    <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-4 h-4 text-sky-400" /> Choose Payment Method
                    </h2>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <button onClick={() => setPayMethod('card')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3
                          ${payMethod === 'card' ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-white text-sm font-semibold">Card</p>
                          <p className="text-white/40 text-[10px]">Credit / Debit</p>
                        </div>
                      </button>
                      <button onClick={() => setPayMethod('upi')}
                        className={`p-4 rounded-xl border-2 transition flex items-center gap-3
                          ${payMethod === 'upi' ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]'}`}>
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-white text-sm font-semibold">UPI</p>
                          <p className="text-white/40 text-[10px]">Scan QR or enter ID</p>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {payMethod === 'card' && (
                        <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Card Number</label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input value={card.number}
                                onChange={e => {
                                  const digits = e.target.value.replace(/\D/g, '').slice(0, 19);
                                  const grouped = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
                                  setCard(c => ({ ...c, number: grouped }));
                                }}
                                placeholder="1234 5678 9012 3456" inputMode="numeric"
                                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white tracking-wider" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Cardholder Name</label>
                            <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} placeholder="Full name"
                              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Expiry (MM/YY)</label>
                              <input value={card.expiry}
                                onChange={e => {
                                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                                  setCard(c => ({ ...c, expiry: v }));
                                }}
                                placeholder="12/29" inputMode="numeric"
                                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white" />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">CVV</label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input type="password" value={card.cvv}
                                  onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                  placeholder="•••" inputMode="numeric"
                                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {payMethod === 'upi' && (
                        <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                          <div className="text-center">
                            <div className="bg-white p-3 rounded-2xl inline-block">
                              {qrDataUrl ? (
                                <img src={qrDataUrl} alt="UPI QR" className="w-[220px] h-[220px]" />
                              ) : (
                                <div className="w-[220px] h-[220px] flex items-center justify-center text-slate-400 text-xs">
                                  Generating QR...
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] text-white/40 mt-3">
                              Scan with any UPI app
                            </p>
                            <p className="text-white/60 text-xs mt-1 font-medium flex items-center justify-center gap-1">
                              voyagewise@upi
                              <button onClick={() => navigator.clipboard?.writeText('voyagewise@upi')}
                                className="text-sky-400 hover:text-sky-300">
                                <Copy className="w-3 h-3" />
                              </button>
                            </p>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Or enter your UPI ID</label>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                              <input value={upiId} onChange={e => setUpiId(e.target.value.trim())}
                                placeholder="yourname@bank"
                                className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 focus:border-emerald-400/50 outline-none text-sm text-white" />
                            </div>
                            <p className="mt-3 text-[10px] text-white/40 leading-relaxed">
                              After paying with your UPI app, click "Pay Now" below to confirm
                              your booking. We'll match the transaction against UPI ID
                              <span className="text-white/70"> {upiId || 'yourname@bank'}</span>.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-300/70 leading-relaxed">
                        <strong className="text-amber-300">Demo payment:</strong> No real payment gateway is involved.
                        Any details you enter here are not transmitted, stored, or charged.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />{error}
                    </div>
                  )}

                  <button onClick={handlePay} disabled={processing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-60">
                    {processing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing payment...</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Pay ₹{total.toLocaleString()} Now</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trip & price summary */}
          <aside className="lg:col-span-1">
            <div className="glass rounded-2xl p-5 sticky top-24">
              <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-3">Your trip</p>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white`}>
                  {meta.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{opt.carrier}</p>
                  <p className="text-[10px] text-white/40">{opt.travelClass}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="text-center min-w-[55px]">
                  <p className="text-base font-bold text-white">{opt.departure}</p>
                  <p className="text-[10px] text-white/30">{opt.source}</p>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[10px] text-white/30 mb-1"><Clock className="w-3 h-3" />{opt.duration}</div>
                  <div className="w-full h-px bg-white/10 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/30" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-400" />
                  </div>
                  <p className="text-[10px] text-white/30 mt-1">{opt.stops === 0 ? 'Direct' : `${opt.stops} stop${opt.stops > 1 ? 's' : ''}`}</p>
                </div>
                <div className="text-center min-w-[55px]">
                  <p className="text-base font-bold text-white">{opt.arrival}</p>
                  <p className="text-[10px] text-white/30">{opt.destination}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                <Calendar className="w-3.5 h-3.5 text-violet-400/70" />
                {new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>

              <div className="border-t border-white/[0.06] pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-white/60"><span>Fare × {passengers.length}</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-white/60"><span>Taxes (5%)</span><span>₹{gst.toLocaleString()}</span></div>
                <div className="flex justify-between text-white/60"><span>Convenience</span><span>₹{convenience.toLocaleString()}</span></div>
                <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" />Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {opt.discount > 0 && (
                <p className="mt-3 text-[10px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {opt.discount}% discount already applied
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
