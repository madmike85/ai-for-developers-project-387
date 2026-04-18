import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create initial event types
  const eventTypes = [
    {
      name: 'Intro Call',
      description: 'Initial introduction call to discuss your needs',
      durationMinutes: 30,
    },
    {
      name: 'Consultation',
      description: 'Detailed consultation session',
      durationMinutes: 60,
    },
    {
      name: 'Quick Chat',
      description: 'Short 15-minute conversation',
      durationMinutes: 15,
    },
  ];

  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { id: 'et-' + eventType.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: 'et-' + eventType.name.toLowerCase().replace(/\s+/g, '-'),
        ...eventType,
      },
    });
  }

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
