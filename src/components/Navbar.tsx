import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, Shield, ChevronDown } from 'lucide-react';
import { getSession, getCurrentUser, logout } from '../store/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const session = getSession();
  const user = getCurrentUser();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);

  const handleLogout = () => { logout(); nav('/'); };
  const isActive = (p: string) => loc.pathname === p;

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0b10]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="relative w-10 h-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform" />
            <div className="absolute inset-[2px] bg-[#0a0b10] rounded-[10px] flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky-400 -rotate-45" />
            </div>
          </motion.div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">VoyageWise</span>
            <span className="block text-[10px] text-sky-400/60 font-medium -mt-0.5 tracking-widest uppercase">Smart Travel</span>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {[['/','Home'],['/search','Search'],['/popular','Routes']].map(([p,l]) => (
            <Link key={p} to={p} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive(p)
                ? 'bg-white/10 text-white shadow-lg shadow-sky-500/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}>{l}</Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {session ? (
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-bright text-white/90 hover:text-white transition-all">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                  {session.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium">{session.role === 'admin' ? 'Admin' : user?.name || 'User'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition ${menu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-2xl">
                    <Link to={session.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} onClick={() => setMenu(false)} className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition">Logout</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/user/login" className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition">Sign In</Link>
              <Link to="/admin/login" className="px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/15 transition flex items-center gap-1.5 border border-white/10">
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-white/70 hover:text-white">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden glass border-t border-white/5 overflow-hidden">
            <div className="p-4 space-y-1">
              {[['/','Home'],['/search','Search'],['/popular','Routes']].map(([p,l]) => (
                <Link key={p} to={p} className="block px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white text-sm font-medium">{l}</Link>
              ))}
              <div className="pt-3 border-t border-white/5 space-y-1">
                {session ? (
                  <>
                    <Link to={session.role==='admin'?'/admin/dashboard':'/user/dashboard'} className="block px-4 py-3 rounded-xl bg-sky-500/10 text-sky-400 text-sm font-medium">Dashboard</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-400 text-sm font-medium">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/user/login" className="block px-4 py-3 rounded-xl bg-white/5 text-white text-sm font-medium text-center">Sign In</Link>
                    <Link to="/admin/login" className="block px-4 py-3 rounded-xl bg-white/10 text-white text-sm font-medium text-center">Admin Portal</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
