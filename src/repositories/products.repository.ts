import { PrismaClient } from "@prisma/client";  
import { createProductInput } from "../types/products";


export class ProductRepository {
    constructor(private prisma: PrismaClient) {}
//     class ProductService {
//   private readonly prisma: PrismaClient; // 1. 변수 선언

//   constructor(prisma: PrismaClient) {
//     this.prisma = prisma; // 2. 생성자에서 값 할당
//   }
// }
    async createProduct(input: createProductInput) {
        const {
            stock = [], 
            discountEndTime,
            discountStartTime,
            ...productData
        } = input;

        const discountStart =
            typeof discountStartTime === 'string' 
            ? new Date(discountStartTime) 
            : discountStartTime ?? null;

        const discountEnd =
            typeof discountEndTime === 'string' 
            ? new Date(discountEndTime) 
            : discountEndTime ?? null;
        
        return this.prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    ...productData,
                    discountStartTime: discountStart,
                    discountEndTime: discountEnd,
                },
            });
            
            if (stock.length > 0) {
                await tx.stock.createMany({
                    data: stock.map((x) => ({
                        productId: created.id,
                        sizeId: x.sizeId,
                        quantity: x.quantity,
                    })),
                });
            }
            
            const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0);
            await tx.product.update({
                where: { id: created.id },
                data: { isSoldOut: totalStock <= 0 },
            });
            return created;
        });    
    }
    async findDetailById(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: { select: { id: true, name: true } },
        category: true,
        stocks: {
          include: {
            size: { select: { id: true, name: true } },
          },
          orderBy: [{ sizeId: "asc" }],
        },
        reviews: {
          select: { rating: true },
        },
        inquiries: {
          include: {
            reply: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });
  }
}
