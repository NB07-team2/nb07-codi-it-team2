import { Prisma } from '@prisma/client';

async function main() {
  await Prisma.grade.upsert({
    where: { id: 'grade_green' },
    update: {},
    create: {
      id: 'grade_green',
      name: 'Green',
      rate: 1,
      minAmount: 0,
    },
  });
}
