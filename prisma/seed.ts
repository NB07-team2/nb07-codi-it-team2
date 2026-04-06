import {
  PrismaClient,
  UserType,
  ProductCategoryName,
  InquiryStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 통합 시드 데이터 시딩 시작...');

  // 1. 등급(Grade) 데이터 시딩
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
      update: {},
      create: grade,
    });
  }
  console.log('✅ 등급 데이터 완료');

  // 2. 테스트 유저 생성
  const hashedPassword = await bcrypt.hash('password123', 10);
  const testUsers = [
    {
      id: 'seller-test-id',
      email: 'seller@test.com',
      name: '테스트판매자',
      password: hashedPassword,
      type: UserType.SELLER,
      gradeId: 'grade_green',
    },
    {
      id: 'buyer-test-id',
      email: 'buyer@test.com',
      name: '테스트구매자',
      password: hashedPassword,
      type: UserType.BUYER,
      gradeId: 'grade_green',
    },
  ];

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  // 장바구니 생성 (구매자용)
  await prisma.cart.upsert({
    where: { buyerId: 'buyer-test-id' },
    update: {},
    create: { buyerId: 'buyer-test-id' },
  });
  console.log('✅ 구매자 장바구니 생성 완료');

  // 3. 판매자 스토어 생성
  let store = await prisma.store.findUnique({
    where: { userId: 'seller-test-id' },
  });
  if (!store) {
    store = await prisma.store.create({
      data: {
        userId: 'seller-test-id',
        name: '무신사',
        address: '강남구',
        detailAddress: '역삼동',
        phoneNumber: '010-2345-6789',
        content: '스토어 상세설명',
        image: '',
      },
    });
  }

  // 4. 카테고리 & 사이즈 데이터
  const catBottom = await prisma.productCategory.upsert({
    where: { name: ProductCategoryName.bottom },
    update: {},
    create: { name: ProductCategoryName.bottom },
  });
  const catSkirt = await prisma.productCategory.upsert({
    where: { name: ProductCategoryName.skirt },
    update: {},
    create: { name: ProductCategoryName.skirt },
  });

  const sizes = await Promise.all([
    prisma.size.upsert({
      where: { name: 'S' },
      update: {},
      create: { name: 'S', enName: 'SMALL', koName: '스몰' },
    }),
    prisma.size.upsert({
      where: { name: 'M' },
      update: {},
      create: { name: 'M', enName: 'MEDIUM', koName: '미디엄' },
    }),
    prisma.size.upsert({
      where: { name: 'L' },
      update: {},
      create: { name: 'L', enName: 'LARGE', koName: '라지' },
    }),
  ]);

  const sizeMap = { S: sizes[0].id, M: sizes[1].id, L: sizes[2].id };

  // 5. 상품(Product) 생성 (재고 포함)
  let products = await prisma.product.findMany({
    where: { storeId: store.id },
  });

  if (products.length === 0) {
    console.log('👖 상품 및 재고 데이터 생성 중...');
    const p1 = await prisma.product.create({
      data: {
        name: 'Basic Jeans',
        content: 'Comfort fit jeans',
        price: 39900,
        storeId: store.id,
        categoryId: catBottom.id,
        image: '',
        stocks: {
          // ✨ 여기서 이미 재고를 만듭니다!
          create: [
            { sizeId: sizeMap.S, quantity: 10 },
            { sizeId: sizeMap.M, quantity: 5 },
          ],
        },
      },
    });
    const p2 = await prisma.product.create({
      data: {
        name: 'White Shirt',
        content: 'Oxford cotton shirt',
        price: 29900,
        storeId: store.id,
        categoryId: catSkirt.id,
        image: '',
        stocks: {
          // ✨ 여기서도 재고를 만듭니다!
          create: [{ sizeId: sizeMap.M, quantity: 15 }],
        },
      },
    });
    products = [p1, p2];

    // ❌ 기존에 에러를 유발했던 prisma.stock.createMany 부분은 삭제했습니다.
    console.log('✅ 상품 및 재고 생성 완료');
  }

  // 6. 주문(Order) 생성
  let orderWithItems = await prisma.order.findFirst({
    where: { userId: 'buyer-test-id' },
    include: { orderItems: true },
  });

  if (!orderWithItems && products.length >= 2) {
    orderWithItems = await prisma.order.create({
      data: {
        userId: 'buyer-test-id',
        name: '테스트구매자',
        phone: '010-0000-0000',
        address: '서울시 강남구 역삼동',
        subtotal: 69800,
        totalQuantity: 2,
        usePoint: 0,
        totalSales: 69800,
        orderItems: {
          create: [
            {
              productId: products[0]!.id,
              name: products[0]!.name,
              price: 39900,
              quantity: 1,
              sizeId: sizeMap.S,
            },
            {
              productId: products[1]!.id,
              name: products[1]!.name,
              price: 29900,
              quantity: 1,
              sizeId: sizeMap.M,
            },
          ],
        },
      },
      include: { orderItems: true },
    });
    console.log('✅ 주문 데이터 생성 완료');
  }

  // 7. 문의(Inquiry) 및 리뷰(Review)
  const existingInquiry = await prisma.inquiry.findFirst({
    where: { userId: 'buyer-test-id' },
  });
  if (!existingInquiry && products.length >= 2) {
    await prisma.inquiry.create({
      data: {
        title: '사이즈 문의',
        content: 'M 사이즈 재입고 되나요?',
        productId: products[0]!.id,
        userId: 'buyer-test-id',
        status: InquiryStatus.WaitingAnswer,
      },
    });
  }

  const existingReview = await prisma.review.findFirst({
    where: { userId: 'buyer-test-id' },
  });
  if (
    !existingReview &&
    orderWithItems &&
    orderWithItems.orderItems.length >= 2
  ) {
    await prisma.review.createMany({
      data: [
        {
          rating: 5,
          content: '핏 좋아요!',
          userId: 'buyer-test-id',
          productId: products[0]!.id,
          orderItemId: orderWithItems.orderItems[0]!.id,
        },
      ],
    });
    console.log('✅ 리뷰 및 문의 데이터 생성 완료');
  }

  console.log('✨ 모든 시드 작업이 성공적으로 완료되었습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시딩 중 오류 발생', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
