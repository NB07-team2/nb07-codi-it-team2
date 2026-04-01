import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 초기 데이터 시딩 시작...');

  // 1. 등급(Grade) 시딩
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
      update: grade,
      create: grade,
    });
  }

  // 2. 테스트 유저 생성
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: '코드잇테스터',
      email: 'test@example.com',
      password: 'password123',
      type: 'BUYER',
      gradeId: 'grade_green',
    },
  });

  // 3. 장바구니 생성
  await prisma.cart.upsert({
    where: { buyerId: user.id },
    update: {},
    create: { buyerId: user.id },
  });

  // 4. 알림 생성
  await prisma.notification.createMany({
    data: [
      { userId: user.id, content: '환영합니다!', type: 'NEW_INQUIRY' },
      { userId: user.id, content: '재고 부족 알림', type: 'SOLDOUT' },
    ],
  });

  // 5. 주문 데이터 2개 생성 (대시보드 합계 테스트용)
  console.log('📊 주문 데이터 생성 중...');
  
  // 주문 1
  await prisma.order.create({
    data: {
      userId: user.id,
      totalSales: 55000,
      orderItems: {
        create: [
          { productId: 'p1', price: 25000, quantity: 1 },
          { productId: 'p2', price: 15000, quantity: 2 },
        ],
      },
    },
  });

  // 주문 2 (추가된 주문)
  await prisma.order.create({
    data: {
      userId: user.id,
      totalSales: 100000,
      orderItems: {
        create: [
          { productId: 'p3', price: 50000, quantity: 2 }
        ],
      },
    },
  });

  console.log('✅ 모든 시드 데이터가 준비되었습니다!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });