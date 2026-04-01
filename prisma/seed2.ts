import { PrismaClient, UserType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1) Grade
  await prisma.grade.upsert({
    where: { id: "grade_green" },
    update: {},
    create: {
      id: "grade_green",
      name: "Green",
      rate: 0,
      minAmount: 0,
    },
  });

  // 2) Users (seller, buyer)
  const seller = await prisma.user.upsert({
    where: { email: "seller1@test.com" },
    update: {},
    create: {
      name: "Seller One",
      email: "seller1@test.com",
      password: "password1234",
      type: UserType.SELLER,
      gradeId: "grade_green",
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: "buyer1@test.com" },
    update: {},
    create: {
      name: "Buyer One",
      email: "buyer1@test.com",
      password: "password1234",
      type: UserType.BUYER,
      gradeId: "grade_green",
    },
  });

  // 3) Store (seller 1:1)
  const store = await prisma.store.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      name: "Seed Store",
      address: "Seoul",
      detailAddress: "Gangnam",
      phoneNumber: "010-0000-0000",
      content: "Store for seeding products",
      userId: seller.id,
      image: null,
    },
  });

  // 4) Categories
  const [catPants, catShirt] = await prisma.$transaction([
    prisma.category.upsert({
      where: { name: "bottom" },
      update: {},
      create: { name: "bottom" },
    }),
    prisma.category.upsert({
      where: { name: "skirt" },
      update: {},
      create: { name: "skirt" },
    }
    ),]);

  // ... 기존 코드 위쪽 ...

// 4.5) Sizes (추가)
const sizes = await Promise.all([
  prisma.size.upsert({
    where: { name: "S" },
    update: {},
    create: { name: "S", enName: "SMALL", koName: "스몰" },
  }),
  prisma.size.upsert({
    where: { name: "M" },
    update: {},
    create: { name: "M", enName: "MEDIUM", koName: "미디엄" },
  }),
  prisma.size.upsert({
    where: { name: "L" },
    update: {},
    create: { name: "L", enName: "LARGE", koName: "라지" },
  }),
]);

// 편하게 쓰기 위해 객체로 맵핑 (선택 사항)
const sizeMap = {
  S: sizes.find(s => s.name === "S")!.id,
  M: sizes.find(s => s.name === "M")!.id,
  L: sizes.find(s => s.name === "L")!.id,
};
  // 5) Products
  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        name: "Basic Jeans",
        image: null,
        content: "Comfort fit jeans",
        price: 39900,
        isSoldOut: false,
        discountRate: 10,
        discountStartTime: new Date("2026-04-01T00:00:00Z"),
        discountEndTime: new Date("2026-04-10T00:00:00Z"),
        storeId: store.id,
        categoryId: catPants.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "White Shirt",
        image: null,
        content: "Oxford cotton shirt",
        price: 29900,
        isSoldOut: false,
        discountRate: null,
        discountStartTime: null,
        discountEndTime: null,
        storeId: store.id,
        categoryId: catShirt.id,
      },
    }),
  ]);

  // 6) Stocks (size별)
  await prisma.stock.createMany({
    data: [
      { productId: products[0].id, sizeId: sizeMap.S, quantity: 5 },
      { productId: products[0].id, sizeId: sizeMap.M, quantity: 3 },
      { productId: products[1].id, sizeId: sizeMap.M, quantity: 10 },
      { productId: products[1].id, sizeId: sizeMap.L, quantity: 8 },
    ],
  });

  // 7) Inquiries
  await prisma.inquiry.createMany({
    data: [
      {
        content: "M 사이즈 재입고 언제 되나요?",
        productId: products[0].id,
        userId: buyer.id,
      },
      {
        content: "세탁은 어떻게 하나요?",
        productId: products[1].id,
        userId: buyer.id,
      },
    ],
  });

  // 8) Reviews (유저-상품당 1개 제한이 이미 스키마에 있음)
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        content: "핏 좋아요!",
        userId: buyer.id,
        productId: products[0].id,
      },
      {
        rating: 4,
        content: "셔츠 재질 괜찮습니다.",
        userId: buyer.id,
        productId: products[1].id,
      },
    ],
  });

  // 9) 확인용 출력
  const result = await prisma.product.findMany({
    include: {
      category: true,
      store: true,
      stocks: { include: { size: true } },
      reviews: { include: { user: true } },
      inquiries: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.dir(
    {
      store: { id: store.id, name: store.name },
      products: result.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        discountRate: p.discountRate,
        isSoldOut: p.isSoldOut,
        stocks: p.stocks.map((s) => ({ size: s.size.name, qty: s.quantity })),
        reviews: p.reviews.map((r) => ({
          rating: r.rating,
          content: r.content,
          user: r.user.email,
        })),
        inquiries: p.inquiries.map((i) => i.content),
      })),
    },
    { depth: null }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());