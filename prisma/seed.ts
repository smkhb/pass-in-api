import { prisma } from '../src/lib/prisma'
import { faker } from '@faker-js/faker'

async function seed() {
  const event = await prisma.event.create({
    data: {
      id: '2c6b43eb-bf38-4f0a-b868-081fa9ec3f27',
      title: 'Show do Bruno Mars',
      slug: 'show-do-bruno-mars',
      details: 'Show do Bruno Mars em Jurere Internacional',
      maximumAttendees: 4000,
     
    }
  })

  const attendees = Array.from({ length: 400 }, () => {
    return {
      name: faker.person.firstName(),
      email: faker.internet.email(),
      createAt: faker.date.recent({ days: 30 }),
      eventId: event.id,
    }
  })

  const promises = attendees.map((attendee) =>
    prisma.attendee.create({data: attendee})
    .then((createdAttendee) =>
      prisma.checkIn.create({
        data: {
          createdAt: faker.date.recent({ days: 7 }),
          attendeeId: createdAttendee.id,
        }
      })
    )
  )

  await Promise.all(promises)
}

seed().then(() => {
    console.log('Database seeded')
    prisma.$disconnect
})