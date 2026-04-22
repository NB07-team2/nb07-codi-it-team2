import { CreateOrderRepoDto } from "../types/order.type";
import prisma from '../utils/prismaClient.util';

export async function createOrder(orderData: CreateOrderRepoDto, userId: string) {
    // 1. orderData에서 구매하려는 아이템 목록을 가져옵니다. 
    const { orderItems: itemsToBuy } = orderData;

    if (!itemsToBuy) {
       return null; // 또는 적절한 에러 처리
    }

    // 2. DB에서 실제 상품 정보를 조회 (가격 정보 및 유효성 검사)
    // 팁: 프론트에서 보낸 가격을 그대로 믿으면 보안에 취약하므로 DB 조회가 필수입니다.
    const productDetails = await Promise.all(
        itemsToBuy.map(async (item) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            return {
                ...item,
                price: product!.price,
                name: product!.name,
            };
        })
    );

    const subtotal = productDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalSales = subtotal - (orderData.usePoint || 0);

    // 3. 트랜잭션 시작
    const order = await prisma.$transaction(async (tx) => {
        // [A] 주문 생성
        const currentOrder = await tx.order.create({
            data: {
                userId: userId,
                name: orderData.name,
                phone: orderData.phone,
                address: orderData.address,
                usePoint: orderData.usePoint || 0,
                subtotal: subtotal,
                totalQuantity: itemsToBuy.reduce((sum, item) => sum + item.quantity, 0),
                totalSales: totalSales,
            },
        });

        // [B] 주문 상세 내역 생성
        await tx.orderItem.createMany({
            data: productDetails.map(item => ({
                orderId: currentOrder.id,
                productId: item.productId,
                sizeId: item.sizeId,
                quantity: item.quantity,
                name: item.name,
                price: item.price,
            })),
        });

        // [C] 결제 대기 데이터 생성
        await tx.payment.create({
            data: {
                price: totalSales,
                status: 'WaitingPayment',
                createdAt: new Date(),
                updatedAt: new Date(), 
                orderId: currentOrder.id,
            },
        });

        // [D] 재고 차감 및 장바구니 해당 항목 삭제
        for (const item of productDetails) {
            // 재고 차감
            await tx.stock.update({
                where: {
                    productId_sizeId: {
                        productId: item.productId,
                        sizeId: item.sizeId,
                    },
                },
                data: { quantity: { decrement: item.quantity } },
            });

            // 장바구니에 해당 상품이 있다면 삭제 (선택 구매/바로 구매 공통 적용)
            // 장바구니를 거치지 않은 '바로 구매'여도 삭제 쿼리는 에러 없이 실행됩니다.
            const userCart = await tx.cart.findFirst({ where: { buyerId: userId } });
            if (userCart) {
                await tx.cartItem.deleteMany({
                    where: {
                        cartId: userCart.id,
                        OR: itemsToBuy.map(item => ({
                            productId: item.productId,
                            sizeId: item.sizeId
                        })),
                    },
                });
            }
        }
        // [E] 포인트 처리 (기존 로직 유지)
        if (orderData.usePoint && orderData.usePoint > 0) {
            await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: orderData.usePoint } },
            });
        } else {
            // 포인트 사용이 없거나 0인 경우, 구매 금액의 10%를 포인트로 적립 (단, 등급에 따라 포인트 적립률도 달라집니다. 여기서는 간단히 10%로 가정)
            const pointsToEarn = Math.floor(totalSales * 0.1);
            await tx.user.update({
                where: { id: userId },
                data: { points: { increment: pointsToEarn } },
            });
        }

        return await tx.order.findUnique({
            where: { id: currentOrder.id },
            include: {
                orderItems: { include: { 
                    product: 
                    {
                        include: {reviews: true}
                    }, 
                    size: true 
                } 
            },
            payments: true,
            },
        });
    });

    return order;
}