import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Search, BarChart3, Lock, Eye, EyeOff, LogOut, Trash2, AlertCircle, CheckCircle, Activity, TrendingUp, Key, RefreshCw } from 'lucide-react';
import { getSession, getUsers, deleteUserAccount, changeAdminPw, logout, getLogs, getSearches } from '../store/auth';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState(getUsers());
  const [logs, setLogs] = useState(getLogs());
  const [searches, setSearches] = useState(getSearches());
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState({ t: '', m: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const session = getSession();

  useEffect(() => { if (!session || session.role !== 'admin') nav('/admin/login'); }, [session, nav]);

  const refresh = () => { setUsers(getUsers()); setLogs(getLogs()); setSearches(getSearches()); };

  const delUser = (id: string) => {
    if (confirm('Delete this user?')) { deleteUserAccount(id); setUsers(getUsers()); setMsg({ t: 's', m: 'User deleted' }); setTimeout(() => setMsg({ t: '', m: '' }), 3000); }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); await new Promise(r => setTimeout(r, 400));
    if (newPw.length < 8) { setMsg({ t: 'e', m: 'Min 8 chars' }); setLoading(false); return; }
    if (changeAdminPw(curPw, newPw)) { setMsg({ t: 's', m: 'Password changed!' }); setCurPw(''); setNewPw(''); }
    else setMsg({ t: 'e', m: 'Wrong current password' }); setLoading(false); setTimeout(() => setMsg({ t: '', m: '' }), 3000);
  };

  if (!session || session.role !== 'admin') return null;

  const routeCounts = searches.reduce((acc, s) => { const k = `${s.source}→${s.destination}`; acc[k] = (acc[k]||0)+1; return acc; }, {} as Record<string,number>);
  const topRoutes = Object.entries(routeCounts).sort((a,b) => b[1]-a[1]).slice(0,8);

  const tabs = [{ id: 'overview', icon: <BarChart3 className="w-4 h-4"/>, l: 'Overview' }, { id: 'users', icon: <Users className="w-4 h-4"/>, l: 'Users' }, { id: 'searches', icon: <Search className="w-4 h-4"/>, l: 'Searches' }, { id: 'activity', icon: <Activity className="w-4 h-4"/>, l: 'Activity' }, { id: 'password', icon: <Key className="w-4 h-4"/>, l: 'Admin Password' }];

  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 mb-6 glow-ring flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><Shield className="w-6 h-6 text-white"/></div>
            <div><h1 className="text-lg font-bold text-white">Admin Dashboard</h1><p className="text-sm text-white/40">VoyageWise Administration</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} className="px-4 py-2 rounded-xl glass-bright text-white/70 text-sm font-medium flex items-center gap-1 hover:text-white transition"><RefreshCw className="w-4 h-4"/>Refresh</button>
            <button onClick={() => { logout(); nav('/'); }} className="px-4 py-2 rounded-xl glass-bright text-white/70 text-sm font-medium flex items-center gap-1 hover:text-white transition"><LogOut className="w-4 h-4"/>Logout</button>
          </div>
        </motion.div>

        <AnimatePresence>{msg.m && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${msg.t==='s'?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{msg.t==='s'?<CheckCircle className="w-4 h-4"/>:<AlertCircle className="w-4 h-4"/>}{msg.m}</motion.div>}</AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl p-2">{tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${tab===t.id?'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20':'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>{t.icon}{t.l}</button>)}</div>
          </div>
          <div className="lg:col-span-3 space-y-5">
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[{ l: 'Users', v: users.length, i: <Users className="w-5 h-5 text-blue-400"/> },
                    { l: 'Searches', v: searches.length, i: <Search className="w-5 h-5 text-emerald-400"/> },
                    { l: 'Avg Budget', v: `₹${searches.length ? Math.round(searches.reduce((s,x)=>s+x.budget,0)/searches.length/1000)+'K' : '0'}`, i: <TrendingUp className="w-5 h-5 text-amber-400"/> },
                    { l: 'Activities', v: logs.length, i: <Activity className="w-5 h-5 text-purple-400"/> }
                  ].map((s,i) => <div key={i} className="glass rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] text-white/30 uppercase tracking-wider">{s.l}</p><p className="text-2xl font-bold text-white mt-1">{s.v}</p></div><div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">{s.i}</div></div></div>)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-3">Top Routes</h3>
                    {topRoutes.length ? topRoutes.map(([r,c],i) => <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] mb-1.5"><div className="flex items-center gap-2"><span className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold flex items-center justify-center">{i+1}</span><span className="text-sm text-white/70">{r}</span></div><span className="text-[10px] text-white/30">{c}x</span></div>) : <p className="text-sm text-white/20 text-center py-4">No data yet</p>}
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-3">Recent Users</h3>
                    {users.length ? users.slice(-5).reverse().map(u => <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] mb-1.5"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{u.name.charAt(0)}</div><div><p className="text-sm text-white/70 font-medium">{u.name}</p><p className="text-[10px] text-white/30">{u.email}</p></div></div>) : <p className="text-sm text-white/20 text-center py-4">No users yet</p>}
                  </div>
                </div>
              </motion.div>
            )}
            {tab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">Users ({users.length})</h3>
                {users.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-white/[0.06]"><th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">User</th><th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Email</th><th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Phone</th><th className="text-left py-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Joined</th><th className="text-right py-2 px-3 text-[10px] uppercase tracking-wider text-white/30 font-semibold">Action</th></tr></thead>
                      <tbody>
                        {users.map(u => <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]"><td className="py-2.5 px-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">{u.name.charAt(0)}</div><span className="text-white/70">{u.name}</span></div></td><td className="py-2.5 px-3 text-white/50">{u.email}</td><td className="py-2.5 px-3 text-white/50">+91 {u.phone}</td><td className="py-2.5 px-3 text-white/30">{new Date(u.createdAt).toLocaleDateString()}</td><td className="py-2.5 px-3 text-right"><button onClick={() => delUser(u.id)} className="p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="w-4 h-4"/></button></td></tr>)}
                      </tbody>
                    </table>
                  </div>
                ) : <div className="text-center py-10 text-white/20"><Users className="w-10 h-10 mx-auto mb-2"/><p>No users yet</p></div>}
              </motion.div>
            )}
            {tab === 'searches' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">All Searches ({searches.length})</h3>
                {searches.length ? searches.slice(0,30).map((s,i) => <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] mb-2"><div className="flex items-center gap-3"><div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-[10px] font-bold">{i+1}</div><div><p className="text-sm text-white/70 font-medium">{s.source} → {s.destination}</p><p className="text-[10px] text-white/30">₹{s.budget.toLocaleString()} • {s.passengers} pax • {s.resultCount} results</p></div></div><span className="text-[10px] text-white/20">{new Date(s.time).toLocaleString()}</span></div>) : <p className="text-sm text-white/20 text-center py-8">No searches yet</p>}
              </motion.div>
            )}
            {tab === 'activity' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">System Activity ({logs.length})</h3>
                {logs.length ? [...logs].reverse().slice(0,40).map((l,i) => <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] mb-2"><div className={`w-7 h-7 rounded-lg flex items-center justify-center ${l.action.includes('login')?'bg-emerald-500/10 text-emerald-400':l.action.includes('delete')?'bg-red-500/10 text-red-400':l.action.includes('pw')?'bg-amber-500/10 text-amber-400':'bg-blue-500/10 text-blue-400'}`}><Activity className="w-3.5 h-3.5"/></div><div className="flex-1"><p className="text-sm text-white/70">{l.detail}</p><p className="text-[10px] text-white/20">User: {l.userId} • {new Date(l.time).toLocaleString()}</p></div></div>) : <p className="text-sm text-white/20 text-center py-8">No activity yet</p>}
              </motion.div>
            )}
            {tab === 'password' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Key className="w-5 h-5 text-amber-400"/></div><div><h3 className="font-semibold text-white">Change Admin Password</h3><p className="text-[10px] text-white/30">Only the owner can change this</p></div></div>
                <form onSubmit={changePw} className="max-w-sm space-y-3">
                  <div><label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Current</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"/><input type={show?'text':'password'} value={curPw} onChange={e=>setCurPw(e.target.value)} className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-indigo-400/50 outline-none text-sm text-white" required/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
                  <div><label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">New</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20"/><input type={show?'text':'password'} value={newPw} onChange={e=>setNewPw(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 focus:border-indigo-400/50 outline-none text-sm text-white" required/></div></div>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium flex items-center gap-1"><Shield className="w-3.5 h-3.5"/>{loading?'Changing...':'Change Password'}</button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
