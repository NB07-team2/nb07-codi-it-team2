import { PrismaClient, ProductCategoryName } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시스템 기초 데이터 시딩 시작...');

  // 1. 등급(Grade) 데이터
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
  console.log('✅ 등급 데이터 시딩 완료');

  // 2. 카테고리(Category) 데이터 - Enum에 정의된 모든 값 등록
  const categoryNames = Object.values(ProductCategoryName);

  for (const name of categoryNames) {
    await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ 카테고리 데이터 시딩 완료');

  // 3. 사이즈(Size) 데이터 - 상품 등록 시 필수 참조 데이터
  const sizes = [
    { name: 'XS', enName: 'XS', koName: 'XS' },
    { name: 'S', enName: 'S', koName: 'S' },
    { name: 'M', enName: 'M', koName: 'M' },
    { name: 'L', enName: 'L', koName: 'L' },
    { name: 'XL', enName: 'XL', koName: 'XL' },
    { name: 'Free', enName: 'FREE', koName: 'Free' },
  ];

  for (const size of sizes) {
    await prisma.size.upsert({
      where: { name: size.name },
      update: { enName: size.enName, koName: size.koName },
      create: size,
    });
  }
  console.log('✅ 사이즈 데이터 시딩 완료');

  console.log('✨ 모든 기초 데이터 작업이 완료되었습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
