import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 등급(Grade) 데이터 시딩 시작...');

  const grades = [
    { id: 'grade_green', name: 'Green', rate: 1, minAmount: 0 },
    { id: 'grade_orange', name: 'Orange', rate: 3, minAmount: 100000 },
    { id: 'grade_red', name: 'Red', rate: 5, minAmount: 300000 },
    { id: 'grade_black', name: 'Black', rate: 7, minAmount: 500000 },
    { id: 'grade_vip', name: 'VIP', rate: 10, minAmount: 1000000 },
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: { id: grade.id },
      update: {
        name: grade.name,
        rate: grade.rate,
        minAmount: grade.minAmount,
      },
      create: grade,
    });
  }

  console.log('✅ 등급 데이터 시딩 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
