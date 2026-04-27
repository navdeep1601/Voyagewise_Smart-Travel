import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Train, Bus, ArrowLeft, Calendar, Clock, MapPin, User, Printer,
  Trash2, Download, ShieldCheck, Sparkles, AlertTriangle,
} from 'lucide-react';
import {
  getCurrentUser, getUserTickets, deleteTicket, isTicketExpired, type Ticket,
} from '../store/auth';
import type { TravelOption } from '../data/pricing';

const TYPE_META: Record<TravelOption['type'], { icon: React.ReactNode; label: string; color: string }> = {
  flight: { icon: <Plane className="w-5 h-5" />, label: 'Flight', color: 'from-blue-500 to-sky-400' },
  train:  { icon: <Train  className="w-5 h-5" />, label: 'Train',  color: 'from-emerald-500 to-teal-400' },
  bus:    { icon: <Bus    className="w-5 h-5" />, label: 'Bus',    color: 'from-amber-500 to-yellow-400' },
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const user = getCurrentUser();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!user) { nav('/user/login'); return; }
    const t = getUserTickets(user.id).find(x => x.id === id) || null;
    setTicket(t);
  }, [id, user, nav]);

  const meta = useMemo(() => ticket ? TYPE_META[ticket.option.type] : null, [ticket]);

  if (!user) return null;
  if (!ticket || !meta) {
    return (
      <div className="min-h-screen bg-[#06070a] pt-32 px-4">
        <div className="max-w-2xl mx-auto text-center text-white/50">
          <AlertTriangle className="w-10 h-10 text-amber-400/60 mx-auto mb-3" />
          <p>This ticket no longer exists or the journey has already passed.</p>
          <button onClick={() => nav('/user/dashboard')} className="mt-4 text-sky-400 text-sm hover:text-sky-300">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const expired = isTicketExpired(ticket);
  const journey = new Date(ticket.journeyDate + 'T00:00:00');
  const daysLeft = Math.ceil((journey.getTime() - Date.now()) / 86400000);

  const handleCancel = () => {
    deleteTicket(ticket.id, user.id);
    nav('/user/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#06070a] pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 no-print">
          <button onClick={() => nav('/user/dashboard')} className="flex items-center gap-1 text-white/50 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()}
              className="px-3 py-2 rounded-lg glass-bright text-white/70 hover:text-white text-xs font-medium flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Cancel ticket
            </button>
          </div>
        </div>

        {/* Boarding pass */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl glow-ring overflow-hidden"
        >
          {/* Header band */}
          <div className={`bg-gradient-to-r ${meta.color} p-5 text-white relative`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-80">Voyage<b>Wise</b> · Boarding Pass</p>
                <h1 className="text-2xl font-bold mt-1">{ticket.option.carrier}</h1>
                <p className="text-xs opacity-80">{ticket.option.travelClass} · {meta.label}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider opacity-70">PNR</p>
                <p className="font-mono text-xl tracking-wider">{ticket.pnr}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3 items-center mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">From</p>
                <p className="text-2xl font-bold text-white">{ticket.option.source}</p>
                <p className="text-xs text-white/50 mt-1">Dep · {ticket.option.departure}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-white mb-2`}>
                  {meta.icon}
                </div>
                <p className="text-[10px] text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" />{ticket.option.duration}</p>
                <p className="text-[10px] text-white/30">{ticket.option.stops === 0 ? 'Direct' : `${ticket.option.stops} stop`}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/40">To</p>
                <p className="text-2xl font-bold text-white">{ticket.option.destination}</p>
                <p className="text-xs text-white/50 mt-1">Arr · {ticket.option.arrival}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
              <Detail label="Date" value={journey.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} icon={<Calendar className="w-3 h-3" />} />
              <Detail label="Status" value={expired ? 'Completed' : daysLeft <= 0 ? 'Today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`} valueClass={expired ? 'text-white/40' : 'text-emerald-400'} />
              <Detail label="Passengers" value={String(ticket.passengers.length)} icon={<User className="w-3 h-3" />} />
              <Detail label="Total Paid" value={`₹${ticket.totalAmount.toLocaleString()}`} valueClass="text-sky-400" />
            </div>

            <div className="border-t border-dashed border-white/10 pt-4 mb-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Passenger Manifest</p>
              <div className="space-y-1">
                {ticket.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-white/[0.03]">
                    <span className="flex items-center gap-2 text-white">
                      <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60">{i + 1}</span>
                      {p.name}
                    </span>
                    <span className="text-white/40 text-xs">Age {p.age}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-dashed border-white/10 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">Payment</p>
                <p className="text-white/80 mt-1 capitalize">{ticket.paymentMethod === 'card' ? 'Card' : 'UPI'}</p>
                <p className="text-white/40 font-mono text-[11px] mt-0.5 break-all">{ticket.paymentRef}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Booked At</p>
                <p className="text-white/80 mt-1">{new Date(ticket.bookedAt).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-sky-500/5 border border-sky-500/15">
              <ShieldCheck className="w-4 h-4 text-sky-400 mt-0.5" />
              <div className="text-[11px] text-sky-200/80 leading-relaxed">
                Carry a valid government photo ID at the time of boarding. This ticket
                will be removed from your account automatically once the journey date
                has passed.
              </div>
            </div>
          </div>
        </motion.div>

        {/* Cancel modal */}
        {confirmDelete && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-5 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-white font-semibold">Cancel this ticket?</h3>
              </div>
              <p className="text-sm text-white/50 mb-4">
                The ticket <b className="text-white/70">{ticket.pnr}</b> will be permanently
                removed from your account. (Demo refunds are not processed.)
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2 rounded-lg glass-bright text-white/70 text-sm font-medium hover:bg-white/15">
                  Keep
                </button>
                <button onClick={handleCancel}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30">
                  Cancel ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, valueClass = 'text-white', icon }: { label: string; value: string; valueClass?: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">{icon}{label}</p>
      <p className={`text-sm font-semibold mt-1 ${valueClass}`}>{value}</p>
    </div>
  );
}
