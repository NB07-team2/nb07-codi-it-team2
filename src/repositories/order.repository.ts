import { Prisma } from "@prisma/client";
import { NotFoundError } from "../errors/errors";
import { CreateOrderRepoDto, OrderMyPagingRepoParams } from "../types/order.type";
import prisma from '../utils/prismaClient.util';
import * as stockRepository from "./stock.repository";

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
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const now = new Date();
             let finalPrice = product.price;

            // 할인 기간 확인 로직
            const isDiscountActive =
            product.discountStartTime &&
            product.discountEndTime &&
            now >= product.discountStartTime &&
            now <= product.discountEndTime;

            // 할인 중이라면 할인가 적용 (할인율 10%면 0.1이므로 1 - 0.1을 곱함)
            if (isDiscountActive && product.discountRate) {
            finalPrice = product.price * (1 - product.discountRate);
            }
            
            
            return {
                ...item,
                originalPrice: product.price, // 정가 정보가 필요한 경우를 위해 추가
                price: finalPrice,            // 최종 적용 가격
                isDiscounted: isDiscountActive, // 할인 적용 여부 플래그
                name: product.name,
            };
        })
    );

    // 1. 할인된 개별 가격(item.price)에 수량을 곱하여 합계를 구합니다.
    const subtotal = productDetails.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
    }, 0);

    // 2. 포인트 사용액을 차감하여 최종 결제 금액을 산출합니다.
    // 포인트가 합계보다 클 경우를 대비해 Math.max(0, ...)를 사용하는 것이 안전합니다.
    const totalSales = Math.max(0, subtotal - (orderData.usePoint || 0));

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
            const existingStock = await stockRepository.getStock(item.productId, item.sizeId);
            if (existingStock < item.quantity) {
                throw new NotFoundError(`상품 ID ${item.productId}의 사이즈 ID ${item.sizeId}에 대한 재고가 부족합니다.`);
            }
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
        const user = await tx.user.findUnique({ 
            where: { id: userId },
            include :{grade: true} 
        });
        if (!user) {
            throw new NotFoundError('유저를 찾을 수 없습니다.');
        }

        const accumulationRate = (user.grade?.rate || 0) / 100;
        const pointsToEarn = Math.floor(totalSales * accumulationRate);
        const netPointChange = pointsToEarn - (orderData.usePoint || 0);

        await tx.user.update({
            where: { id: userId },
            data: {
                points: {
                    increment: netPointChange
                }
            },
        });
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

export async function getOrderMyList(params:OrderMyPagingRepoParams, userId: string) {
    const { page, limit,status } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    const whereCondition: Prisma.OrderWhereInput = {
        userId: userId,
    };

    if (status) {
        whereCondition.payments = {
            is: {
                status: status,
            },
        };
    }

    const [data, meta] = await prisma.$transaction([
        prisma.order.findMany({
            where: whereCondition,
            skip: skip,
            take: take,
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: {
                    include: {
                        product: {
                        include: {reviews: true}
                        },
                        size: {
                            select: { id: true, enName: true, koName: true},
                        },
                        review: {
                            select: { id: true, rating: true, content: true, createdAt: true },
                        },
                    },
                },
                payments: true,
            },
        }),
        prisma.order.count({
            where: whereCondition,
        }),
    ]);

    return {
        data,
        meta: {
            total: meta,
            page: page,
            limit: limit,
            totalPages : Math.ceil(meta / limit),
        },
    };
}

export async function getOrderDetail(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: userId,
        },
        include: {
            orderItems: {
                include: {
                    product: {
                        include: {reviews: true}
                    },
                    size: {
                        select: { id: true, enName: true, koName: true},
                    },
                },
            },
            payments: true,
        },
    });
    return order;
}


export async function getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });
    return order;
}