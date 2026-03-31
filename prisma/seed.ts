import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Idempotent — skip if already seeded
  const existingAgent = await prisma.agent.findFirst()
  if (existingAgent) {
    console.log('✅ Database already seeded — skipping')
    return
  }

  console.log('🌱 Seeding fresh database...')

  const agentHash = await bcrypt.hash('agent123', 12)
  await prisma.agent.create({ data: { username: 'admin', passwordHash: agentHash } })

  const hash = (pw: string) => bcrypt.hash(pw, 12)

  const lockedPlayer = await prisma.user.create({
    data: { username: 'ghost99', passwordHash: await hash('1234'), locked: true, status: 'FREE' },
  })
  const vipPlayer = await prisma.user.create({
    data: { username: 'viper_vip', passwordHash: await hash('1234'), locked: false, status: 'VIP' },
  })
  const vvipPlayer = await prisma.user.create({
    data: { username: 'elite_vvip', passwordHash: await hash('1234'), locked: false, status: 'VVIP' },
  })

  for (const user of [lockedPlayer, vipPlayer, vvipPlayer]) {
    await prisma.conversation.create({ data: { userId: user.id } })
  }

  await prisma.notification.create({
    data: {
      userId: lockedPlayer.id,
      type: 'NEW_MESSAGE',
      title: '👋 Welcome to Vault!',
      body: 'Submit your ID image in live chat to unlock your account.',
    },
  })

  await prisma.paymentMethod.createMany({
    data: [
      { type: 'DEPOSIT', name: 'Cash App', tag: '$VaultCashApp', note: 'Send exact amount. Include your username in memo.', active: true, sortOrder: 1 },
      { type: 'DEPOSIT', name: 'Chime', tag: '$VaultChime', note: 'Instant transfers accepted 24/7.', active: true, sortOrder: 2 },
      { type: 'DEPOSIT', name: 'Zelle', tag: 'vault@payments.com', note: 'Bank transfers may take up to 30 minutes.', active: true, sortOrder: 3 },
      { type: 'REDEEM', name: 'Cash App', tag: '$YourCashTag', note: 'Provide your Cash App tag to agent in chat.', active: true, sortOrder: 1 },
      { type: 'REDEEM', name: 'Chime', tag: '$YourChimeTag', note: 'Processing within 1 hour during business hours.', active: true, sortOrder: 2 },
    ],
  })

  await prisma.promo.createMany({
    data: [
      { title: 'Welcome Bonus', code: 'WELCOME50', description: 'Get 50% bonus on your first deposit. Valid for all new members.', statuses: 'FREE,VIP,VVIP', active: true },
      { title: 'VIP Reload Bonus', code: 'VIPLOAD25', description: 'Exclusive 25% reload bonus every Friday for VIP members.', statuses: 'VIP,VVIP', active: true },
      { title: 'Elite Cashback', code: 'ELITECB10', description: 'VVIP exclusive: 10% cashback on all activity every week.', statuses: 'VVIP', active: true },
    ],
  })

  await prisma.game.createMany({
    data: [
      { title: 'Dragon Slots', description: 'Spin the reels and win big!', link: 'https://example.com/dragon-slots', active: true, sortOrder: 1 },
      { title: 'Blackjack Pro', description: 'Classic card game with live dealers.', link: 'https://example.com/blackjack', active: true, sortOrder: 2 },
      { title: 'Roulette Royale', description: 'European roulette with premium tables.', link: 'https://example.com/roulette', active: true, sortOrder: 3 },
    ],
  })

  await prisma.siteSettings.create({
    data: {
      id: 'singleton',
      messageOfDay: '🎰 Welcome to Vault! Deposit now and claim your Welcome Bonus with code WELCOME50.',
      depositTag: '$VaultDaily2024',
      redeemTag: '$RedeemVault',
    },
  })

  console.log('✅ Seed complete!')
  console.log('   Agent:   admin / agent123')
  console.log('   Players: ghost99 / viper_vip / elite_vvip  (PIN: 1234)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
