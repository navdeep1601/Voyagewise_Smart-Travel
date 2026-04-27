import type { TravelOption } from '../data/pricing';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  createdAt: string;
  lastLogin: string;
}

export interface ActivityLog {
  userId: string;
  action: string;
  detail: string;
  time: string;
}

export interface Passenger {
  name: string;
  age: number;
}

export type PaymentMethod = 'card' | 'upi';

export interface Ticket {
  id: string;
  pnr: string;
  userId: string;
  option: TravelOption;
  passengers: Passenger[];
  journeyDate: string;       // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  paymentRef: string;        // masked card last4 or UPI id
  totalAmount: number;
  bookedAt: string;          // ISO
}

const KEYS = {
  users: 'ts_users',
  session: 'ts_session',
  admin: 'ts_admin',
  logs: 'ts_logs',
  searches: 'ts_searches',
  tickets: 'ts_tickets',
};

// ── Admin credentials (owner-only) ──
const DEFAULT_ADMIN = { username: 'owner', password: 'TravelAdmin@2024' };

function getAdmin() {
  const s = localStorage.getItem(KEYS.admin);
  return s ? JSON.parse(s) : DEFAULT_ADMIN;
}

export function adminLogin(u: string, p: string): boolean {
  const a = getAdmin();
  if (a.username === u && a.password === p) {
    localStorage.setItem(KEYS.session, JSON.stringify({ role: 'admin' }));
    addLog('admin', 'login', 'Admin logged in');
    return true;
  }
  return false;
}

export function changeAdminPw(cur: string, next: string): boolean {
  const a = getAdmin();
  if (a.password === cur) {
    localStorage.setItem(KEYS.admin, JSON.stringify({ ...a, password: next }));
    addLog('admin', 'pw_change', 'Admin password changed');
    return true;
  }
  return false;
}

// ── Users ──
export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(KEYS.users) || '[]');
}

export function registerUser(name: string, email: string, phone: string, password: string): User | null {
  const users = getUsers();
  if (users.find(u => u.email === email)) return null;
  const u: User = { id: `U${Date.now()}`, name, email, phone, password, createdAt: new Date().toISOString(), lastLogin: '' };
  users.push(u);
  localStorage.setItem(KEYS.users, JSON.stringify(users));
  addLog(u.id, 'register', `New user: ${name}`);
  return u;
}

export function loginUser(email: string, password: string): User | null {
  const users = getUsers();
  const u = users.find(x => x.email === email && x.password === password);
  if (!u) return null;
  u.lastLogin = new Date().toISOString();
  localStorage.setItem(KEYS.users, JSON.stringify(users));
  localStorage.setItem(KEYS.session, JSON.stringify({ role: 'user', id: u.id }));
  addLog(u.id, 'login', `${u.name} logged in`);
  return u;
}

export function changeUserPw(id: string, cur: string, next: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0 || users[idx].password !== cur) return false;
  users[idx].password = next;
  localStorage.setItem(KEYS.users, JSON.stringify(users));
  addLog(id, 'pw_change', 'Password changed');
  return true;
}

export function updateProfile(id: string, data: Partial<User>): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx < 0) return false;
  users[idx] = { ...users[idx], ...data };
  localStorage.setItem(KEYS.users, JSON.stringify(users));
  return true;
}

export function deleteUserAccount(id: string): boolean {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(KEYS.users, JSON.stringify(users));
  // Also delete this user's tickets
  const tickets = getAllTickets().filter(t => t.userId !== id);
  localStorage.setItem(KEYS.tickets, JSON.stringify(tickets));
  addLog(id, 'deleted', 'Account deleted');
  return true;
}

// ── Session ──
export function getSession(): { role: 'admin' | 'user'; id?: string } | null {
  const s = localStorage.getItem(KEYS.session);
  return s ? JSON.parse(s) : null;
}

export function getCurrentUser(): User | null {
  const s = getSession();
  if (!s || s.role !== 'user' || !s.id) return null;
  return getUsers().find(u => u.id === s.id) || null;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

// ── Activity Logs ──
function addLog(userId: string, action: string, detail: string) {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem(KEYS.logs) || '[]');
  logs.push({ userId, action, detail, time: new Date().toISOString() });
  if (logs.length > 500) logs.splice(0, logs.length - 500);
  localStorage.setItem(KEYS.logs, JSON.stringify(logs));
}

export function getLogs(): ActivityLog[] {
  return JSON.parse(localStorage.getItem(KEYS.logs) || '[]');
}

export function getUserLogs(id: string): ActivityLog[] {
  return getLogs().filter(l => l.userId === id);
}

// ── Search History ──
export interface SearchRecord {
  source: string;
  destination: string;
  budget: number;
  date: string;
  passengers: number;
  resultCount: number;
  time: string;
}

export function saveSearch(r: SearchRecord) {
  const all: SearchRecord[] = JSON.parse(localStorage.getItem(KEYS.searches) || '[]');
  all.unshift(r);
  if (all.length > 100) all.splice(100);
  localStorage.setItem(KEYS.searches, JSON.stringify(all));
}

export function getSearches(): SearchRecord[] {
  return JSON.parse(localStorage.getItem(KEYS.searches) || '[]');
}

// ── Tickets ──
export function getAllTickets(): Ticket[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.tickets) || '[]');
  } catch {
    return [];
  }
}

/** Returns true if the journey for this ticket is in the past (date < today). */
export function isTicketExpired(t: Ticket, now: Date = new Date()): boolean {
  // A journey is considered completed once the day after the journey date begins.
  // i.e. ticket expires at midnight (local) following the journey date.
  const j = new Date(t.journeyDate + 'T00:00:00');
  const expiresAt = new Date(j.getTime() + 24 * 60 * 60 * 1000);
  return now >= expiresAt;
}

/** Removes any tickets whose journey has finished. Returns the number removed. */
export function purgeExpiredTickets(): number {
  const all = getAllTickets();
  const fresh = all.filter(t => !isTicketExpired(t));
  const removed = all.length - fresh.length;
  if (removed > 0) {
    localStorage.setItem(KEYS.tickets, JSON.stringify(fresh));
    addLog('system', 'auto_cleanup', `Auto-removed ${removed} completed ticket(s)`);
  }
  return removed;
}

export function getUserTickets(userId: string): Ticket[] {
  purgeExpiredTickets();
  return getAllTickets()
    .filter(t => t.userId === userId)
    .sort((a, b) => a.journeyDate.localeCompare(b.journeyDate));
}

function generatePNR(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const pick = (set: string, n: number) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join('');
  return pick(letters, 2) + pick('0123456789', 6);
}

export function saveTicket(input: {
  userId: string;
  option: TravelOption;
  passengers: Passenger[];
  journeyDate: string;
  paymentMethod: PaymentMethod;
  paymentRef: string;
  totalAmount: number;
}): Ticket {
  const ticket: Ticket = {
    id: `T${Date.now()}${Math.floor(Math.random() * 1000)}`,
    pnr: generatePNR(),
    bookedAt: new Date().toISOString(),
    ...input,
  };
  const all = getAllTickets();
  all.push(ticket);
  localStorage.setItem(KEYS.tickets, JSON.stringify(all));
  addLog(
    input.userId,
    'booking',
    `Booked ${input.option.type} ${input.option.carrier} ${input.option.source}→${input.option.destination} on ${input.journeyDate} (PNR ${ticket.pnr})`,
  );
  return ticket;
}

export function deleteTicket(ticketId: string, userId: string): boolean {
  const all = getAllTickets();
  const idx = all.findIndex(t => t.id === ticketId && t.userId === userId);
  if (idx < 0) return false;
  const t = all[idx];
  all.splice(idx, 1);
  localStorage.setItem(KEYS.tickets, JSON.stringify(all));
  addLog(userId, 'cancel', `Cancelled ticket ${t.pnr}`);
  return true;
}
