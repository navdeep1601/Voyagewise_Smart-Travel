import { City } from './cities';

export interface TravelOption {
  id: string;
  type: 'flight' | 'train' | 'bus';
  source: string;
  destination: string;
  price: number;
  duration: string;
  departure: string;
  arrival: string;
  carrier: string;
  travelClass: string;
  stops: number;
  rating: number;
  co2: number;
  amenities: string[];
  discount: number;
  seats: number;
}

/* ─── Airline Data ─── */
const AIRLINES = [
  { name: "IndiGo",        mult: 1.00, rating: 4.2, classes: ["Economy", "Premium Economy"] },
  { name: "SpiceJet",      mult: 0.88, rating: 3.8, classes: ["Economy"] },
  { name: "Air India",      mult: 1.30, rating: 4.1, classes: ["Economy", "Premium Economy", "Business"] },
  { name: "Vistara",        mult: 1.40, rating: 4.5, classes: ["Economy", "Premium Economy", "Business"] },
  { name: "Akasa Air",      mult: 0.80, rating: 4.0, classes: ["Economy"] },
  { name: "AirAsia India",  mult: 0.75, rating: 3.7, classes: ["Economy"] },
  { name: "GoFirst",        mult: 0.82, rating: 3.5, classes: ["Economy"] },
  { name: "Alliance Air",   mult: 0.90, rating: 3.4, classes: ["Economy"] },
];

const FLIGHT_CLASS_MULT: Record<string, number> = {
  "Economy": 1.0,
  "Premium Economy": 1.6,
  "Business": 3.2,
};

/* ─── Train Data ─── */
const TRAINS = [
  { name: "Vande Bharat Express",  mult: 1.30 },
  { name: "Rajdhani Express",      mult: 1.00 },
  { name: "Shatabdi Express",      mult: 0.95 },
  { name: "Duronto Express",       mult: 0.90 },
  { name: "Tejas Express",         mult: 1.10 },
  { name: "Humsafar Express",      mult: 0.75 },
  { name: "Garib Rath",            mult: 0.55 },
  { name: "Sampark Kranti",        mult: 0.60 },
  { name: "Superfast Express",     mult: 0.50 },
  { name: "Jan Shatabdi",          mult: 0.45 },
  { name: "Mail Express",          mult: 0.35 },
];

const TRAIN_CLASSES = [
  { name: "1A (First Class AC)",  mult: 5.5 },
  { name: "2A (AC 2-Tier)",      mult: 3.2 },
  { name: "3A (AC 3-Tier)",      mult: 2.0 },
  { name: "SL (Sleeper)",        mult: 1.0 },
  { name: "CC (AC Chair Car)",   mult: 1.7 },
  { name: "2S (Second Sitting)", mult: 0.45 },
];

/* ─── Bus Data ─── */
const BUS_TYPES = [
  { name: "Volvo Multi-Axle AC Sleeper", mult: 2.8, rating: 4.4 },
  { name: "Mercedes AC Seater",          mult: 3.0, rating: 4.5 },
  { name: "AC Sleeper",                  mult: 2.4, rating: 4.1 },
  { name: "Volvo AC Seater",             mult: 2.2, rating: 4.2 },
  { name: "Semi-Sleeper AC",             mult: 1.8, rating: 3.9 },
  { name: "AC Seater",                   mult: 1.5, rating: 3.8 },
  { name: "Non-AC Sleeper",              mult: 1.3, rating: 3.5 },
  { name: "Non-AC Seater",               mult: 1.0, rating: 3.2 },
  { name: "Ordinary / Express",          mult: 0.7, rating: 2.9 },
];

const BUS_OPS = [
  "RSRTC", "KSRTC", "MSRTC", "UPSRTC", "APSRTC", "HRTC",
  "Neeta Travels", "VRL Travels", "SRS Travels", "KPN Travels",
  "Paulo Travels", "Parveen Travels", "Kallada Travels", "Orange Travels",
  "Raj National Express", "Prasanna Purple", "Intercity SmartBus", "National Travels",
];

/* ─── Helpers ─── */

function haversine(a: City, b: City): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function fmtDur(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (hrs === 0) return `${mins}m`;
  return mins === 0 ? `${hrs}h` : `${hrs}h ${mins}m`;
}

function fmtTime(baseHr: number, offsetMin: number): string {
  const total = ((baseHr * 60 + offsetMin) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Better spread deterministic pseudo-random 0..1 */
function rng(src: City, dst: City, idx: number): number {
  const hash = Math.abs(Math.sin(src.lat * 9127 + dst.lng * 7561 + idx * 3571)) * 10000;
  return hash - Math.floor(hash);
}

/* ─── Main Generator ─── */

export function generateOptions(src: City, dst: City, budget: number): TravelOption[] {
  const d = haversine(src, dst);
  const options: TravelOption[] = [];
  let id = 0;

  /* ──────────── FLIGHTS ──────────── */
  if (d > 150) {
    for (let i = 0; i < AIRLINES.length; i++) {
      const al = AIRLINES[i];
      for (const cls of al.classes) {
        const r = rng(src, dst, i * 100 + (cls === "Economy" ? 1 : cls === "Premium Economy" ? 2 : 3));
        const perKm = 3.5 + r * 4.5;
        const base = d * perKm;
        const raw = Math.round(base * al.mult * FLIGHT_CLASS_MULT[cls]);
        const floor = cls === "Economy" ? 1800 : cls === "Premium Economy" ? 3500 : 8000;
        const price = Math.max(raw, floor);
        const disc = Math.round(r * 35);
        const final = Math.round(price * (1 - disc / 100));

        if (final <= budget * 2.0) {
          const hrs = d / 750 + 0.6 + r * 0.3;
          const depHr = (5 + i * 2 + (cls === "Business" ? 4 : 0)) % 24;
          options.push({
            id: `F${id++}`,
            type: "flight",
            source: src.name,
            destination: dst.name,
            price: final,
            duration: fmtDur(hrs),
            departure: fmtTime(depHr, i * 15),
            arrival: fmtTime(depHr + Math.ceil(hrs), i * 15 + Math.round(hrs * 60) % 60),
            carrier: al.name,
            travelClass: cls,
            stops: r > 0.7 ? (r > 0.9 ? 1 : 0) : 0,
            rating: al.rating + (cls === "Business" ? 0.3 : 0),
            co2: Math.round(d * 0.25),
            amenities: cls === "Business"
              ? ["Lounge Access", "Flat Bed", "Gourmet Meal", "Baggage 30kg", "Priority Boarding"]
              : cls === "Premium Economy"
                ? ["Extra Legroom", "Meal", "Baggage 20kg", "USB Power"]
                : ["Baggage 15kg", "Meal", "Entertainment", "USB Power"],
            discount: disc,
            seats: Math.floor(5 + r * 180),
          });
        }
      }
    }
  }

  /* ──────────── TRAINS (limited to 5 trains × 4 classes = 20 max) ──────────── */
  const trainSubset = TRAINS.slice(0, 5);
  const classSubset = TRAIN_CLASSES.slice(0, 4);
  for (let i = 0; i < trainSubset.length; i++) {
    const t = trainSubset[i];
    for (let j = 0; j < classSubset.length; j++) {
      const tc = classSubset[j];
      const r = rng(src, dst, i * 50 + j * 7 + 500);
      const perKm = 0.4 + r * 1.2;
      const base = d * perKm;
      const raw = Math.round(base * t.mult * tc.mult);
      const price = Math.max(raw, 60);
      const disc = Math.round(r * 20);
      const final = Math.round(price * (1 - disc / 100));

      if (final <= budget * 1.8 && final > 40) {
        const hrs = d / 55 + 1.0 + r * 1.5;
        const depHr = (i * 3 + j * 2) % 24;
        options.push({
          id: `T${id++}`,
          type: "train",
          source: src.name,
          destination: dst.name,
          price: final,
          duration: fmtDur(hrs),
          departure: fmtTime(depHr, j * 10),
          arrival: fmtTime(depHr + Math.ceil(hrs), j * 10 + Math.round(hrs * 60) % 60),
          carrier: t.name,
          travelClass: tc.name,
          stops: Math.floor(r * 7),
          rating: 3.0 + r * 2.0,
          co2: Math.round(d * 0.04),
          amenities: tc.name.includes("AC") || tc.name.includes("1A") || tc.name.includes("2A") || tc.name.includes("3A") || tc.name.includes("CC")
            ? ["AC Coach", "Pantry Car", "Charging", "Bedding", "Bio Toilet"]
            : ["Pantry Car", "Charging Points", "Bio Toilet", "Fan"],
          discount: disc,
          seats: Math.floor(30 + r * 600),
        });
      }
    }
  }

  /* ──────────── BUSES (all routes < 1500km) ──────────── */
  if (d < 1500) {
    for (let i = 0; i < BUS_TYPES.length; i++) {
      const b = BUS_TYPES[i];
      const r = rng(src, dst, i * 30 + 900);
      const opIdx = Math.floor(r * BUS_OPS.length);
      const perKm = 1.0 + r * 1.5;
      const base = d * perKm;
      const raw = Math.round(base * b.mult);
      const price = Math.max(raw, 120);
      const disc = Math.round(r * 25);
      const final = Math.round(price * (1 - disc / 100));

      if (final <= budget * 1.8 && final > 60) {
        const hrs = d / 40 + 1.5 + r * 1.0;
        const depHr = (17 + i * 2) % 24;
        options.push({
          id: `B${id++}`,
          type: "bus",
          source: src.name,
          destination: dst.name,
          price: final,
          duration: fmtDur(hrs),
          departure: fmtTime(depHr, i * 20),
          arrival: fmtTime(depHr + Math.ceil(hrs), i * 20 + Math.round(hrs * 60) % 60),
          carrier: BUS_OPS[opIdx],
          travelClass: b.name,
          stops: Math.floor(r * 4),
          rating: b.rating,
          co2: Math.round(d * 0.09),
          amenities: b.name.includes("AC") || b.name.includes("Volvo") || b.name.includes("Mercedes")
            ? ["AC", "USB Charging", "Water Bottle", "Blanket", "Pillow"]
            : ["Fan", "USB Charging", "Water Bottle"],
          discount: disc,
          seats: Math.floor(5 + r * 45),
        });
      }
    }
  }

  options.sort((a, b) => a.price - b.price);
  return options;
}

/* ─── Recommendation Helpers ─── */

export function getCheapestByType(options: TravelOption[]): Record<string, TravelOption | null> {
  const result: Record<string, TravelOption | null> = { flight: null, train: null, bus: null };
  for (const opt of options) {
    if (!result[opt.type] || opt.price < result[opt.type]!.price) {
      result[opt.type] = opt;
    }
  }
  return result;
}

export function getBestValue(options: TravelOption[]): TravelOption | null {
  if (!options.length) return null;
  const scored = options.map(o => ({
    ...o,
    score: (10000 / Math.max(o.price, 1)) * 0.4
         + (o.rating / 5) * 100 * 0.3
         + (100 / Math.max(parseFloat(o.duration), 1)) * 0.3,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0];
}

export function getFastest(options: TravelOption[]): TravelOption | null {
  if (!options.length) return null;
  return [...options].sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration))[0];
}

export function getGreenest(options: TravelOption[]): TravelOption | null {
  if (!options.length) return null;
  return [...options].sort((a, b) => a.co2 - b.co2)[0];
}

export function getRecommendations(options: TravelOption[], budget: number) {
  const within = options.filter(o => o.price <= budget);
  const pool = within.length ? within : options;
  return {
    cheapest: pool[0] || null,
    bestValue: getBestValue(pool),
    fastest: getFastest(pool),
    greenest: getGreenest(pool),
    byType: getCheapestByType(pool),
    totalOptions: within.length,
  };
}
