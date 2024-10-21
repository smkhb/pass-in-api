import { prisma } from '../src/lib/prisma'

async function seed() {
  await prisma.event.create({
    data: {
      id: '2c6b43eb-bf38-4f0a-b868-081fa9ec3f27',
      title: 'Event 1',
      slug: 'event-1',
      details: 'Event 1 Description',
      maximumAttendees: 100,
     
    }
  })
}

seed().then(() => {
    console.log('Database seeded')
    prisma.$disconnect
})