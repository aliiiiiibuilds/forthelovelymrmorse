#!/bin/bash
set -e

echo ""
echo "🔐 VAULT PLATFORM SETUP"
echo "========================"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js 18+ first."
  exit 1
fi

echo "✓ Node.js $(node -v)"

# Install deps
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy env if missing
if [ ! -f .env ]; then
  echo ""
  echo "📝 Creating .env from example..."
  cp .env.example .env
  echo "   ⚠️  Edit .env to set a strong JWT_SECRET before production!"
fi

# Setup DB
echo ""
echo "🗄️  Setting up database..."
npm run db:push

# Seed
echo ""
echo "🌱 Seeding demo data..."
npm run db:seed

# Create upload dirs
mkdir -p public/uploads/chat
mkdir -p public/uploads/qrcodes
mkdir -p public/uploads/id-images
mkdir -p public/uploads/avatars

echo ""
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Start the server:  npm run dev"
echo "  Open:              http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Demo credentials:"
echo "  Agent:    admin / agent123  →  /agent/login"
echo "  Locked:   ghost99 / 1234"
echo "  VIP:      viper_vip / 1234"
echo "  VVIP:     elite_vvip / 1234"
echo ""
