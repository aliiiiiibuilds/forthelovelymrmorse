# 🔐 Vault Platform

A full-stack premium gaming platform with player portal and agent dashboard.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Prisma** ORM + **SQLite** database
- **JWT** authentication (via `jose`)
- **bcryptjs** password hashing
- Polling-based realtime chat (3s interval)
- Dark neon UI — Rajdhani + DM Sans fonts

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create env file
cp .env.example .env

# 3. Initialize database
npm run db:push

# 4. Seed with demo data
npm run db:seed

# 5. Start dev server
npm run dev
```

Visit **http://localhost:3000**

---

## Demo Credentials

### Agent Dashboard → http://localhost:3000/agent/login
| Username | Password |
|----------|----------|
| `admin`  | `agent123` |

### Player Portal → http://localhost:3000/login
| Username     | Password | Status | Access   |
|--------------|----------|--------|----------|
| `ghost99`    | `1234`   | FREE   | 🔒 Locked |
| `viper_vip`  | `1234`   | VIP    | ✓ Unlocked |
| `elite_vvip` | `1234`   | VVIP   | ✓ Unlocked |

---

## Features

### Player Portal
- Sign up / Login
- Dashboard with Message of the Day & daily tags
- **Deposit page** — browse active payment methods, view tag/QR
- **Redeem page** — view redemption options
- **Promo page** — see bonuses filtered by your tier (FREE/VIP/VVIP)
- **Live Chat** — real-time chat with agent, image uploads, ID submission button
- Locked accounts restricted to chat only (enforced by middleware)

### Agent Dashboard
- **Dashboard** — stats overview, recent players & chats
- **Players** — search, create, lock/unlock, assign tier, delete
- **Player Detail** — full profile, edit access/tier, view submitted ID images
- **Live Chat** — see all conversations, reply with text & images
- **Payment Methods** — create/edit/delete deposit & redeem methods, upload QR codes
- **Promotions** — create/edit/delete promos with tier visibility & expiry
- **Site Settings** — Message of the Day, daily deposit tag, daily redeem tag

---

## Project Structure

```
vault-platform/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data seeder
├── src/
│   ├── middleware.ts        # Route protection (JWT + locked-user guard)
│   ├── lib/
│   │   ├── auth.ts         # JWT sign/verify utilities
│   │   └── prisma.ts       # Prisma client singleton
│   ├── app/
│   │   ├── globals.css     # Global dark neon theme
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Player login
│   │   ├── signup/         # Player signup
│   │   ├── (player)/       # Player layout group
│   │   │   ├── dashboard/  # Player dashboard
│   │   │   ├── deposit/    # Deposit page
│   │   │   ├── redeem/     # Redeem page
│   │   │   ├── promo/      # Promotions page
│   │   │   └── chat/       # Live chat
│   │   ├── agent/          # Agent area (separate layout)
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── players/
│   │   │   ├── chat/
│   │   │   ├── payment-methods/
│   │   │   ├── promos/
│   │   │   └── settings/
│   │   └── api/            # All API routes
│   │       ├── auth/       # signup, login, agent-login, logout, me
│   │       ├── player/     # me, payment-methods, promos, settings
│   │       ├── agent/      # players, chat, payment-methods, promos, settings
│   │       ├── chat/       # messages (player↔agent)
│   │       └── upload/     # image upload handler
│   └── components/
│       ├── player/PlayerSidebar.tsx
│       ├── agent/AgentSidebar.tsx
│       └── ui/             # Button, Card, Input
└── public/
    └── uploads/            # Uploaded files (chat, qrcodes, id-images)
```

---

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
UPLOAD_DIR="./public/uploads"
```

---

## npm Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:push      # Apply schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:reset     # Reset DB and re-seed
```

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in httpOnly cookies (no XSS access)
- Middleware enforces role-based access (PLAYER / AGENT)
- Locked players blocked from deposit/redeem/promo at middleware level
- File uploads validated for image MIME types and 5MB size limit
- All agent routes protected server-side

---

## Database Models

| Model | Purpose |
|-------|---------|
| `User` | Player accounts |
| `Agent` | Agent accounts (separate table) |
| `Conversation` | One-to-one thread per player |
| `Message` | Chat messages (text + image + isIdImage flag) |
| `PaymentMethod` | Deposit/Redeem methods with tag & QR code |
| `Promo` | Promo codes with tier visibility & expiry |
| `SiteSettings` | Singleton: message of day, daily tags |
| `UploadedFile` | Tracks all uploaded files |
