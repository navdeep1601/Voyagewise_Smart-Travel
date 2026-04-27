import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Plane, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { registerUser } from '../store/auth';

export default function UserRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const reqs = [{ ok: pw.length >= 8, l: '8+ chars' }, { ok: /[A-Z]/.test(pw), l: 'Upper' }, { ok: /[0-9]/.test(pw), l: 'Number' }];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!name || !email || !phone || !pw) { setErr('Fill all fields'); setLoading(false); return; }
    if (pw.length < 8) { setErr('Min 8 characters'); setLoading(false); return; }
    if (pw !== cpw) { setErr('Passwords don\'t match'); setLoading(false); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr('Valid 10-digit phone required'); setLoading(false); return; }
    const u = registerUser(name, email, phone, pw);
    if (u) nav('/user/login');
    else { setErr('Email already registered'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06070a] px-4 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-[10%] w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} className="relative w-full max-w-md">
        <div className="glass rounded-3xl glow-ring overflow-hidden">
          <div className="p-8 pb-6 text-center border-b border-white/[0.06]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center"><Plane className="w-7 h-7 text-white -rotate-45" /></div>
            <h1 className="text-2xl font-bold text-white">Join VoyageWise</h1>
            <p className="text-white/40 text-sm mt-1">Create your free account</p>
          </div>
          <div className="p-8">
            {err && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" /></div></div>
              <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" /></div></div>
              <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Phone</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><span className="absolute left-9 top-1/2 -translate-y-1/2 text-white/30 text-sm">+91</span><input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" className="w-full pl-16 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" /></div></div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={show?'text':'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Strong password" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
                </div>
                {pw && <div className="flex gap-2 mt-1.5">{reqs.map((r,i) => <span key={i} className={`flex items-center gap-1 text-[10px] ${r.ok?'text-emerald-400':'text-white/20'}`}><CheckCircle className="w-3 h-3"/>{r.l}</span>)}</div>}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1 block">Confirm</label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input type={show?'text':'password'} value={cpw} onChange={e => setCpw(e.target.value)} placeholder="Confirm password" className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border outline-none text-sm text-white placeholder-white/20 ${cpw&&pw!==cpw?'border-red-500/50':'border-white/10 focus:border-sky-400/50'}`} /></div>
                {cpw && pw !== cpw && <p className="text-red-400 text-[10px] mt-1">Passwords don't match</p>}
              </div>
              <div className="flex items-start gap-2"><input type="checkbox" className="mt-1 accent-sky-500" required /><p className="text-[10px] text-white/30">I agree to the <a href="#" className="text-sky-400">Terms</a> and <a href="#" className="text-sky-400">Privacy Policy</a></p></div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-white/30">Already have an account? <Link to="/user/login" className="text-sky-400 font-semibold hover:text-sky-300">Sign In</Link></p>
          </div>
        </div>
        <p className="text-center mt-5 text-sm"><Link to="/" className="text-white/30 hover:text-white/60">← Back to Home</Link></p>
      </motion.div>
    </div>
  );
}
