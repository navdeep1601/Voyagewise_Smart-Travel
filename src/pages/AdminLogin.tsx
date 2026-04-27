import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, User, AlertCircle, Key } from 'lucide-react';
import { adminLogin } from '../store/auth';

export default function AdminLogin() {
  const [user, setUser] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (!user || !pw) { setErr('Fill all fields'); setLoading(false); return; }
    if (adminLogin(user, pw)) nav('/admin/dashboard');
    else { setErr('Invalid admin credentials'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06070a] px-4 pt-20 pb-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[100px]" />
        <div className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full" />
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }} className="relative w-full max-w-md">
        <div className="glass rounded-3xl glow-ring overflow-hidden">
          <div className="p-8 pb-6 text-center border-b border-white/[0.06]">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><Shield className="w-7 h-7 text-white" /></div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/40 text-sm mt-1">Authorized access only</p>
          </div>
          <div className="mx-8 mt-5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-400/60 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-400/60 leading-relaxed">Restricted to authorized administrators only.</p>
          </div>
          <div className="p-8">
            {err && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"><AlertCircle className="w-4 h-4 flex-shrink-0"/>{err}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5 block">Username</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"/><input value={user} onChange={e=>setUser(e.target.value)} placeholder="Admin username" className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-indigo-400/50 outline-none text-sm text-white placeholder-white/20"/></div></div>
              <div><label className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-1.5 block">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"/><input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="Admin password" className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:border-indigo-400/50 outline-none text-sm text-white placeholder-white/20"/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-500/20 transition disabled:opacity-50">
                {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Verifying...</span></div> : <><Shield className="w-4 h-4"/><span>Access Admin Panel</span></>}
              </button>
            </form>
            <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-white/20 text-[10px] uppercase tracking-wider mb-3">Default Credentials</p>
              <div className="glass-bright rounded-xl p-4 inline-block">
                <p className="text-xs text-white/50">Username: <code className="text-indigo-400 bg-white/[0.06] px-2 py-0.5 rounded font-mono">owner</code></p>
                <p className="text-xs text-white/50 mt-2">Password: <code className="text-indigo-400 bg-white/[0.06] px-2 py-0.5 rounded font-mono">TravelAdmin@2024</code></p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-5 text-sm"><Link to="/" className="text-white/30 hover:text-white/60">← Back to Home</Link></p>
      </motion.div>
    </div>
  );
}
