import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Plane, ArrowRight, AlertCircle } from 'lucide-react';
import { loginUser } from '../store/auth';

export default function UserLogin() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/user/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (!email || !pw) { setErr('Fill all fields'); setLoading(false); return; }
    const u = loginUser(email, pw);
    if (u) nav(redirect);
    else { setErr('Invalid credentials. Register if new.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06070a] px-4 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[100px]" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} className="relative w-full max-w-md">
        <div className="glass rounded-3xl glow-ring overflow-hidden">
          <div className="p-8 pb-6 text-center border-b border-white/[0.06]">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center"><Plane className="w-7 h-7 text-white -rotate-45" /></motion.div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-white/40 text-sm mt-1">Sign in to VoyageWise</p>
          </div>
          <div className="p-8">
            {err && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"><AlertCircle className="w-4 h-4 flex-shrink-0" />{err}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5 block">Email</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" /></div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-sky-400/50 outline-none text-sm text-white placeholder-white/20" />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-sky-500/20 transition disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-white/30">Don't have an account? <Link to="/user/register" className="text-sky-400 font-semibold hover:text-sky-300">Register</Link></p>
          </div>
        </div>
        <p className="text-center mt-5 text-sm"><Link to="/" className="text-white/30 hover:text-white/60">← Back to Home</Link></p>
      </motion.div>
    </div>
  );
}
