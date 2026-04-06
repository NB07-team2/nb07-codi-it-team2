import prisma from "../utils/prismaClient.util";

export const findByBuyerId = async (buyerId: string) => {
    return await prisma.cart.findUnique({
        where: { buyerId },
        include: { items: true}
    })
}

export const createCart = async (buyerId: string) => {
    return await prisma.cart.create({
        data: { buyerId },
        include: { items: true }
    });
};