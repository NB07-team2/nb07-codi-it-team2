import { PrismaClient, UserType } from "@prisma/client";

const prisma = new PrismaClient();
// 상품, 리뷰 생성 확인 시드 파일입니다.
async function main() {
  // 1) Grade (User.gradeId의 default가 grade_green 이라서, 없으면 User 생성이 깨질 수 있음)
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

  // 2) Seller + Store (Store.userId가 unique라서 1:1로 생성)
  const seller = await prisma.user.upsert({
    where: { email: "seller1@test.com" },
    update: {
      type: UserType.SELLER,
      gradeId: "grade_green",
    },
    create: {
      name: "Seller One",
      email: "seller1@test.com",
      password: "password1234",
      type: UserType.SELLER,
      gradeId: "grade_green",
      // image는 default가 있으니 생략 가능
    },
  });

  const store = await prisma.store.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      name: "Seed Store",
      address: "Seoul",
      detailAddress: "Gangnam",
      phoneNumber: "010-0000-0000",
      content: "Seed store for product/review test",
      userId: seller.id,
      image: null,
    },
  });

  // 3) Buyer (리뷰 작성자)
  const buyer = await prisma.user.upsert({
    where: { email: "buyer1@test.com" },
    update: {
      type: UserType.BUYER,
      gradeId: "grade_green",
    },
    create: {
      name: "Buyer One",
      email: "buyer1@test.com",
      password: "password1234",
      type: UserType.BUYER,
      gradeId: "grade_green",
    },
  });

  // 4) Products (storeId 필요)
  const products = await prisma.product.createMany({
    data: [
      {
        name: "T-Shirt",
        description: "Seed T-Shirt",
        price: 12900,
        image: null,
        isActive: true,
        storeId: store.id,
      },
      {
        name: "Jeans",
        description: "Seed Jeans",
        price: 39900,
        image: null,
        isActive: true,
        storeId: store.id,
      },
    ],
  });

  // createMany는 생성된 레코드 반환을 안 해줘서, 다시 조회
  const createdProducts = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "asc" },
  });

  // 5) Reviews (userId, productId 필요)
  // 같은 상품에 여러 리뷰 허용(현재 스키마는 @@unique([userId, productId]) 없음)
  await prisma.review.createMany({
    data: [
      {
        rating: 5,
        content: "Good quality!",
        userId: buyer.id,
        productId: createdProducts[0].id,
      },
      {
        rating: 4,
        content: "Nice fit.",
        userId: buyer.id,
        productId: createdProducts[1].id,
      },
    ],
  });

  // 6) 확인 출력 (상품 + 리뷰 포함)
  const result = await prisma.product.findMany({
    where: { storeId: store.id },
    include: {
      store: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.dir(
    {
      store: { id: store.id, name: store.name },
      productsCreated: products.count,
      products: result.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        reviews: p.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          userEmail: r.user.email,
        })),
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
  .finally(async () => {
    await prisma.$disconnect();
  });