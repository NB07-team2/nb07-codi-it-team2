import prisma from '../utils/prismaClient.util';

export async function getStock(productId: string, sizeId: number) {
    const stock = await prisma.stock.findUnique({
        where: {
            productId_sizeId: {
                productId,
                sizeId,
            },
        },
    });
    return stock ? stock.quantity : 0;
}