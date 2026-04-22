import { CreateOrderRepoDto } from "../types/order.type";
import prisma from '../utils/prismaClient.util';

export async function createOrder(orderData: CreateOrderRepoDto, userId: string) {
    const exsistingCart = await prisma.cart.findFirst({
        where: {
            buyerId: userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });

    if (!exsistingCart || exsistingCart.items.length === 0) {
        throw new Error('장바구니가 비어있습니다.');
    }
        
    const order = await prisma.$transaction(async (tx) => {
        const currentOrder = await tx.order.create({
            data: {
                userId: userId,
                name: orderData.name,
                phone: orderData.phone,
                address: orderData.address,
                usePoint: orderData.usePoint || 0,
                subtotal: exsistingCart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
                totalQuantity: exsistingCart.items.reduce((sum, item) => sum + item.quantity, 0),
                totalSales: exsistingCart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) - (orderData.usePoint || 0),
            },
        });
        await tx.orderItem.createMany({
            data: exsistingCart.items.map(item => ({
                orderId: currentOrder.id,
                productId: item.productId,
                sizeId: item.sizeId,
                quantity: item.quantity,
                name: item.product.name,
                price: item.product.price,
            })),
        });
        await tx.payment.create({
            data: {
                id: `PAY-${Date.now()}`,
                orderId: currentOrder.id,
                price: currentOrder.totalSales,
                status: 'WaitingPayment',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // 주문이 생성된 후 재고 수량 업데이트
        for (const item of exsistingCart.items) {
            await tx.stock.update({
                where: {
                    productId_sizeId: {
                        productId: item.productId,
                        sizeId: item.sizeId,
                    },
                },
                data: {
                    quantity: {
                        decrement: item.quantity,
                    },
                },
            });
        }
        // 포인트 사용시 유저 포인트 차감
        if (orderData.usePoint && orderData.usePoint > 0) {
            await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    points: {
                        decrement: orderData.usePoint,
                    },
                },
            });
        }
        //포인트 미사용시 유저 포인트 적립 (총 결제 금액의 10% 적립)
        if (!orderData.usePoint || orderData.usePoint === 0) {
            const pointsToAdd = Math.floor(currentOrder.totalSales * 0.1);
            await tx.user.update({
                where: {
                    id: userId,
                },
                data: {
                    points: {
                        increment: pointsToAdd,
                    },
                },
            });
        }
        // 주문이 생성된 후 장바구니 비우기
        await tx.cartItem.deleteMany({
            where: {
                cartId: exsistingCart.id,
            },
        });

        return await tx.order.findUnique({
            where: {
                id: currentOrder.id,
            },
            include: {
                orderItems: {
                    include: {
                        product: true,
                        size: true,
                        review: true,
                    },
                },
                payments: true,
            },
        });
    });

    return order;   
}

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

export async function getUserPoints(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            points: true,
        },
    });
    return user ? user.points : 0;
}   