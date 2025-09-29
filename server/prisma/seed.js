import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starter seeding...');

  // Opprett inspektører
  await prisma.inspector.createMany({
    data: [
      { name: 'Ida Klem Henriksen' },
      { name: 'Tore Glomseth Rauland' },
    ],
    skipDuplicates: true, // Hopper over hvis de finnes fra før
  });

  // Opprett klasserom
  const classrooms = [
    'Auditoriet', 'Biologi', 'Fysikk', 'G28', 'G29', 'Kjemi', 'Lille kantine', 
    'Naturfag', 'Personalrom', 'R01', 'R02', 'R03', 'R04', 'R05', 'R11', 
    'R12', 'R13', 'R14', 'R15', 'R16', 'R21', 'R22', 'R23', 'R24', 'R25', 
    'R26', 'R27'
  ];

  // Bruk createMany med skipDuplicates for idempotent seeding
  await prisma.classroom.createMany({
    data: classrooms.map((name) => ({ name })),
    skipDuplicates: true,
  });

  console.log('Seeding fullført.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });