# VoyageWise — Smart Budget Travel

A frontend-only travel comparison platform with simulated ticket booking
(card or UPI QR), passenger management, and auto-expiring tickets.

## Run it on your laptop

You need **Node.js 20 or newer**. Get it from [nodejs.org](https://nodejs.org)
if you don't already have it.

You can use either `npm` (which comes with Node) or `pnpm` — both work.

### With npm

```bash
npm install
npm run dev
```

### With pnpm

```bash
npm install -g pnpm    # one-time, only if you don't have pnpm
pnpm install
pnpm dev
```

The dev server prints a local URL (defaults to `http://localhost:5173`).
Open it in your browser.

## Useful commands

| Command          | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `npm run dev`    | Start the dev server with hot reload               |
| `npm run build`  | Build a production bundle into `dist/`             |
| `npm run preview`| Serve the built bundle locally                     |
| `npm run typecheck` | Type-check the project without building         |

To stop the dev server, press `Ctrl + C` in the terminal.

## Logins

- **User**: register a new account at `/user/register`. All accounts live
  in your browser's local storage.
- **Admin (owner)**: `owner` / `TravelAdmin@2024` at `/admin/login`.

## What's inside

```
src/
  App.tsx              # routes
  main.tsx             # entry
  index.css            # Tailwind v4 + custom utilities
  components/
    Navbar.tsx
    Footer.tsx
  data/
    cities.ts          # 45+ Indian cities
    pricing.ts         # synthetic flight/train/bus generators
  store/
    auth.ts            # users, session, search history, tickets
  pages/
    Home.tsx
    SearchPage.tsx
    PopularRoutes.tsx
    UserLogin.tsx
    UserRegister.tsx
    UserDashboard.tsx
    AdminLogin.tsx
    AdminDashboard.tsx
    BookingPage.tsx
    TicketDetailPage.tsx
  utils/cn.ts
```

## A note on payments

Card and UPI flows are completely simulated — there is no real payment
gateway. The UPI QR is a real `upi://pay?...` URI you can scan, but no
backend will ever receive or settle the transaction. Card details are
never sent anywhere; only the last four digits are saved with the ticket
record in your browser.

## Auto-cleanup of tickets

Tickets disappear from your account automatically once their journey date
has passed. The dashboard surfaces a small toast telling you how many
were removed.
