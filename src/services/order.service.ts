import { UserType } from "@prisma/client";
import { CreateOrderDto, OrderResponseDto } from "../models/order.model";
import * as orderRepository from "../repositories/order.repository";
import { OrderCreateInput } from "../structs/order.struct";
import { ForbiddenError, NotFoundError } from "../errors/errors";
import * as pointRepository from "../repositories/point.repository";
import * as stockRepository from "../repositories/stock.repository";
export async function createOrder(orderData: OrderCreateInput, userId: string,userType: UserType) {
    if(userType !== 'BUYER'){   
        throw new ForbiddenError('주문은 구매자만 가능합니다.');
    }
    const dto = new CreateOrderDto(orderData);
    
    // 사용 포인트 검증
    if (dto.usePoint && dto.usePoint > 0) {
        const userPoint = await pointRepository.getUserPoints(userId);    
        if (dto.usePoint > userPoint) {
            throw new ForbiddenError('사용 포인트가 보유 포인트를 초과합니다.');
        }
    }

    for (const item of dto.orderItems) {
        const existingStock = await stockRepository.getStock(item.productId, item.sizeId);
        if (existingStock < item.quantity) {
            throw new NotFoundError(`상품 ID ${item.productId}의 사이즈 ID ${item.sizeId}에 대한 재고가 부족합니다.`);
        }
    }
    const createdOrder = await orderRepository.createOrder({
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
        orderItems: dto.orderItems.map(item => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
        })),
        usePoint: dto.usePoint || 0,

    }, userId);
    if (!createdOrder) {
        throw new NotFoundError('주문 생성에 실패했습니다.');
    }
    return new OrderResponseDto(createdOrder);
}   