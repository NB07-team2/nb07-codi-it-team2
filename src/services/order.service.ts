import { UserType } from "@prisma/client";
import { CreateOrderDto, OrderResponseDto, UpdateOrderDto } from "../models/order.model";
import * as orderRepository from "../repositories/order.repository";
import { OrderCreateInput } from "../structs/order.struct";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/errors";
import * as pointRepository from "../repositories/point.repository";
import { OrderStatus } from "../types/order.type";
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

export async function getOrderMyList(params: { page: number; limit: number;status?: OrderStatus;}, userId: string, userType: UserType) {
    if(userType !== 'BUYER'){   
        throw new ForbiddenError('주문 조회는 구매자만 가능합니다.');
    }
    const { page, limit, status } = params;
    const orderListData = await orderRepository.getOrderMyList({ page, limit, status }, userId);
    return {
        data: orderListData.data.map(order => new OrderResponseDto(order)),
        meta: orderListData.meta,
    };
} 


export async function getOrderDetail(orderId: string, userId: string, userType: UserType) {
    if(userType !== 'BUYER'){   
        throw new ForbiddenError('주문 상세 조회는 구매자만 가능합니다.');
    }

    const existingOrder = await orderRepository.getOrderById(orderId);
    if (!existingOrder) {
        throw new NotFoundError('주문을 찾을 수 없습니다.');
    }

    if (existingOrder.userId !== userId) {
        throw new ForbiddenError('본인의 주문만 상세 조회할 수 있습니다');
    }

    const order = await orderRepository.getOrderDetail(orderId, userId);
    return new OrderResponseDto(order!);
}

export async function updateOrder(orderId: string, updateData: UpdateOrderDto, userId: string, userType: UserType) {
    if(userType !== 'BUYER'){   
        throw new ForbiddenError('주문 수정은 구매자만 가능합니다.');
    }
    const existingOrder = await orderRepository.getOrderById(orderId);
    if (!existingOrder) {
        throw new NotFoundError('주문을 찾을 수 없습니다.');
    }
    if (existingOrder.userId !== userId) {
        throw new ForbiddenError('본인의 주문만 수정할 수 있습니다.');
    }
    const updatedOrder = await orderRepository.updateOrder(orderId, updateData);
    if (!updatedOrder) {
        throw new BadRequestError('주문 수정에 실패했습니다.');
    }
    return new OrderResponseDto(updatedOrder!);
} 

export async function cancelOrder(orderId: string, userId: string, userType: UserType) {
    if(userType !== 'BUYER'){   
        throw new ForbiddenError('주문 취소는 구매자만 가능합니다.');
    }
    const existingOrder = await orderRepository.getOrderById(orderId);
    if (!existingOrder) {
        throw new NotFoundError('주문을 찾을 수 없습니다.');
    }
    if (existingOrder.userId !== userId) {
        throw new ForbiddenError('본인의 주문만 취소할 수 있습니다.');
    }
    
    const existingPayment = await orderRepository.getPaymentInfo(orderId);
    if (!existingPayment) {
        throw new NotFoundError('결제 정보를 찾을 수 없습니다.');
    }
    if (existingPayment.status !== 'WaitingPayment') {
        throw new BadRequestError('주문 취소는 결제 대기 상태에서만 가능합니다.');
    }   

    const cancelledOrder = await orderRepository.cancelOrder(orderId, userId, existingOrder.usePoint);
    return cancelledOrder;
}
