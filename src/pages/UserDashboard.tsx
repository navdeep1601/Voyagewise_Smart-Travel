import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Calendar, Activity, LogOut, Edit3, Save, X, Trash2, Lock,
  Shield, Award, MapPin, Clock, AlertTriangle, Eye, EyeOff, Plane, Train, Bus,
  Ticket as TicketIcon, ArrowRight, Search,
} from 'lucide-react';
import {
  getCurrentUser, logout, getUserLogs, updateProfile, changeUserPw,
  deleteUserAccount, getUserTickets, purgeExpiredTickets, isTicketExpired,
  type Ticket,
} from '../store/auth';

const TYPE_ICON = {
  flight: <Plane className="w-4 h-4" />,
  train:  <Train className="w-4 h-4" />,
  bus:    <Bus className="w-4 h-4" />,
};

const TYPE_COLOR = {
  flight: 'from-blue-500 to-sky-400',
  train:  'from-emerald-500 to-teal-400',
  bus:    'from-amber-500 to-yellow-400',
};

export default function UserDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [tab, setTab] = useState<'overview' | 'tickets' | 'profile' | 'security'>('overview');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [logs, setLogs] = useState(user ? getUserLogs(user.id) : []);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [purged, setPurged] = useState(0);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  const refreshTickets = () => {
    if (!user) return;
    const removed = purgeExpiredTickets();
    if (removed > 0) setPurged(removed);
    setTickets(getUserTickets(user.id));
  };

  useEffect(() => {
    if (!user) {
      nav('/user/login');
      return;
    }
    refreshTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  const handleSave = () => {
    updateProfile(user.id, { name, phone });
    setUser({ ...user, name, phone });
    setEditMode(false);
  };

  const handlePwChange = () => {
    if (!curPw || !newPw) { setPwMsg('Fill both fields'); return; }
    if (newPw.length < 6) { setPwMsg('New password too short'); return; }
    const ok = changeUserPw(user.id, curPw, newPw);
    setPwMsg(ok ? '✓ Password changed successfully' : '✗ Current password incorrect');
    if (ok) { setCurPw(''); setNewPw(''); }
  };

  const handleDelete = () => {
    deleteUserAccount(user.id);
    logout();
    nav('/');
  };

  const handleLogout = () => { logout(); nav('/'); };

  const upcoming = tickets.filter(t => !isTicketExpired(t));

  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {purged > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-3 mb-4 flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/5">
            <TicketIcon className="w-4 h-4 text-emerald-400" />
            <p className="text-sm text-emerald-300/90">
              {purged} completed ticket{purged > 1 ? 's were' : ' was'} cleared automatically.
            </p>
            <button onClick={() => setPurged(0)} className="ml-auto text-emerald-400/70 hover:text-emerald-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <aside className="glass rounded-2xl p-5 h-fit">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-white/40 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1 text-sm">
              {[
                { id: 'overview' as const, icon: <Activity className="w-4 h-4" />, label: 'Overview' },
                { id: 'tickets'  as const, icon: <TicketIcon className="w-4 h-4" />, label: `My Tickets${upcoming.length ? ` (${upcoming.length})` : ''}` },
                { id: 'profile'  as const, icon: <User className="w-4 h-4" />, label: 'Profile' },
                { id: 'security' as const, icon: <Shield className="w-4 h-4" />, label: 'Security' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2 transition
                    ${tab === t.id ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-white/60 hover:bg-white/5'}`}>
                  {t.icon}{t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full px-3 py-2 mt-3 rounded-lg text-left flex items-center gap-2 text-red-400/80 hover:bg-red-500/10">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </aside>

          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {tab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="glass rounded-2xl p-6 glow-ring">
                    <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {user.name.split(' ')[0]}</h2>
                    <p className="text-white/40 text-sm">Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Stat icon={<TicketIcon className="w-5 h-5" />} label="Active Tickets" val={upcoming.length} color="sky" />
                    <Stat icon={<Activity className="w-5 h-5" />} label="Activity Logs" val={logs.length} color="indigo" />
                    <Stat icon={<Award className="w-5 h-5" />} label="Account Status" val="Active" color="emerald" textVal />
                  </div>

                  {/* Upcoming snapshot */}
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white flex items-center gap-2"><TicketIcon className="w-4 h-4 text-sky-400" /> Upcoming trips</h3>
                      <button onClick={() => setTab('tickets')} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                        View all <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    {upcoming.length === 0 ? (
                      <div className="text-center py-8">
                        <Plane className="w-10 h-10 text-white/10 mx-auto mb-2" />
                        <p className="text-white/40 text-sm">You don't have any upcoming trips.</p>
                        <Link to="/search" className="inline-flex items-center gap-1 mt-3 text-xs px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20">
                          <Search className="w-3 h-3" /> Find a trip
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {upcoming.slice(0, 3).map(t => <TicketRow key={t.id} t={t} onView={() => nav(`/ticket/${t.id}`)} />)}
                      </div>
                    )}
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-sky-400" />Recent Activity</h3>
                    {logs.length === 0 ? <p className="text-white/30 text-sm">No activity yet</p> : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {logs.slice(-15).reverse().map((l, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center"><Clock className="w-3 h-3 text-sky-400" /></div>
                            <div className="flex-1 min-w-0"><p className="text-sm text-white/80 truncate">{l.detail}</p><p className="text-[10px] text-white/30">{new Date(l.time).toLocaleString('en-IN')}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {tab === 'tickets' && (
                <motion.div key="tk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">My Tickets</h2>
                      <p className="text-xs text-white/40 mt-0.5">Tickets disappear automatically after the journey date.</p>
                    </div>
                    <Link to="/search" className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-xs font-semibold flex items-center gap-1 hover:shadow-lg hover:shadow-sky-500/20 transition">
                      <Search className="w-3.5 h-3.5" /> New booking
                    </Link>
                  </div>

                  {upcoming.length === 0 ? (
                    <div className="glass rounded-2xl p-10 text-center">
                      <TicketIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
                      <p className="text-white/50 font-medium">No active tickets right now</p>
                      <p className="text-xs text-white/30 mt-1">Book your next trip and it will show up here.</p>
                      <Link to="/search" className="inline-flex items-center gap-1 mt-5 px-4 py-2 rounded-xl bg-sky-500/10 text-sky-400 text-sm font-medium hover:bg-sky-500/20">
                        <Search className="w-4 h-4" /> Search routes
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcoming.map(t => <TicketRow key={t.id} t={t} onView={() => nav(`/ticket/${t.id}`)} expanded />)}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'profile' && (
                <motion.div key="pr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-white">Profile</h2>
                    {!editMode ? <button onClick={() => setEditMode(true)} className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 text-xs flex items-center gap-1"><Edit3 className="w-3 h-3" />Edit</button> : <div className="flex gap-2"><button onClick={handleSave} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs flex items-center gap-1"><Save className="w-3 h-3" />Save</button><button onClick={() => { setEditMode(false); setName(user.name); setPhone(user.phone); }} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs flex items-center gap-1"><X className="w-3 h-3" />Cancel</button></div>}
                  </div>
                  <div className="space-y-4">
                    {[{ icon: User, label: 'Name', val: name, set: setName, edit: true },
                      { icon: Mail, label: 'Email', val: user.email, set: () => {}, edit: false },
                      { icon: Phone, label: 'Phone', val: phone, set: setPhone, edit: true },
                      { icon: Calendar, label: 'Member Since', val: new Date(user.createdAt).toLocaleString('en-IN'), set: () => {}, edit: false }
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <f.icon className="w-4 h-4 text-white/30" />
                        <div className="flex-1"><p className="text-[10px] uppercase tracking-wider text-white/40">{f.label}</p>{editMode && f.edit ? <input value={f.val} onChange={e => f.set(e.target.value)} className="w-full px-2 py-1 mt-1 rounded bg-white/5 border border-white/10 outline-none text-sm text-white" /> : <p className="text-white text-sm">{f.val}</p>}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'security' && (
                <motion.div key="sc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="glass rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-sky-400" />Change Password</h2>
                    <div className="space-y-3">
                      <PwInput placeholder="Current password" val={curPw} set={setCurPw} show={showCur} setShow={setShowCur} />
                      <PwInput placeholder="New password (min 6 chars)" val={newPw} set={setNewPw} show={showNew} setShow={setShowNew} />
                      {pwMsg && <p className={`text-sm ${pwMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{pwMsg}</p>}
                      <button onClick={handlePwChange} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold text-sm">Update Password</button>
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6 border border-red-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <div className="flex-1"><h3 className="font-bold text-white mb-1">Danger Zone</h3><p className="text-sm text-white/50 mb-4">Permanently delete your account and all data.</p>
                        {!delConfirm ? <button onClick={() => setDelConfirm(true)} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold flex items-center gap-2 hover:bg-red-500/20"><Trash2 className="w-4 h-4" />Delete Account</button> : <div className="space-y-2"><p className="text-sm text-red-400 font-semibold">Are you sure?</p><div className="flex gap-2"><button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-bold">Yes, delete</button><button onClick={() => setDelConfirm(false)} className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm">Cancel</button></div></div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, val, color, textVal }: { icon: React.ReactNode; label: string; val: string | number; color: string; textVal?: boolean }) {
  const map: Record<string, string> = {
    sky: 'from-sky-500/15 to-sky-500/5 text-sky-400 border-sky-500/20',
    indigo: 'from-indigo-500/15 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
  };
  return (
    <div className={`glass rounded-2xl p-4 bg-gradient-to-br ${map[color]} border`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span></div>
      <p className={`font-bold text-white ${textVal ? 'text-lg' : 'text-2xl'}`}>{val}</p>
    </div>
  );
}

function PwInput({ placeholder, val, set, show, setShow }: { placeholder: string; val: string; set: (s: string) => void; show: boolean; setShow: (b: boolean) => void }) {
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/[0.06] border border-white/10 outline-none text-sm text-white" />
      <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
    </div>
  );
}

function TicketRow({ t, onView, expanded }: { t: Ticket; onView: () => void; expanded?: boolean }) {
  const journey = new Date(t.journeyDate + 'T00:00:00');
  const daysLeft = Math.ceil((journey.getTime() - Date.now()) / 86400000);
  return (
    <button onClick={onView}
      className="w-full text-left glass-bright rounded-xl p-4 hover:bg-white/10 transition flex items-center gap-3 group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TYPE_COLOR[t.option.type]} flex items-center justify-center text-white flex-shrink-0`}>
        {TYPE_ICON[t.option.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white text-sm truncate">{t.option.source} → {t.option.destination}</p>
          <span className="text-[10px] text-white/30 font-mono">{t.pnr}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
          <span>{t.option.carrier}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.passengers.length} pax</span>
          <span>·</span>
          <span>{journey.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        {expanded && (
          <p className="text-[11px] text-white/30 mt-1.5">
            Departure {t.option.departure} · Arrival {t.option.arrival} · {t.option.duration}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-white">₹{t.totalAmount.toLocaleString()}</p>
        <p className={`text-[10px] ${daysLeft <= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {daysLeft <= 0 ? 'Today' : `${daysLeft}d to go`}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition" />
    </button>
  );
}
