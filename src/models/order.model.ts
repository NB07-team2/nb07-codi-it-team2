import { OrderCreateInput } from "../structs/order.struct";
import { OrderCreateItem } from "../types/order.type";

export class CreateOrderDto{
    name: string;
    phone: string;
    address: string;
    orderItems: {
        productId: string;
        sizeId: number;
        quantity: number;
        name: string;
    }[];
    usePoint?: number;

    constructor(data: OrderCreateInput) {
        this.name = data.name;
        this.phone = data.phone;
        this.address = data.address;
        this.orderItems = data.orderItems.map(item => ({
            productId: item.productId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            name: item.name,
        }));
        this.usePoint = data.usePoint || 0;
    }
}

export class OrderResponseDto {
    id: string;
    name: string;
    phone: string;
    address: string;
    subtotal: number;
    totalQuantity: number;
    usePoint: number;
    createdAt: Date;
    orderItems: {
        id: string;
        price: number;
        quantity: number;
        productId: string;
        product: {
            name: string;
            image: string | null;
            reviews?: {
                id: string;
                rating: number;
                content: string;
                createdAt: Date;
            }[];
        };
        size: {
            id: number;
            size?:{
                enName: string | null;
                koName: string | null;
            };
        };
        isReviewed: boolean;
    }[];
    payments: {
        id: string;
        price: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        orderId: string;
    } | null;
    constructor(data: OrderCreateItem) {
        this.id = data.id;
        this.name = data.name;
        this.phone = data.phone;
        this.address = data.address;
        this.subtotal = data.subtotal;
        this.totalQuantity = data.totalQuantity;
        this.usePoint = data.usePoint;
        this.createdAt = data.createdAt;
        this.orderItems = data.orderItems.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
            product: {
                name: item.product.name,
                image: item.product.image,
                reviews: item.product.reviews?.map(review => ({
                    id: review.id,
                    rating: review.rating,
                    content: review.content,
                    createdAt: review.createdAt,
                })),
            },
            size: {
                id: item.size.id,
                size: {
                    enName: item.size.enName || '',
                    koName: item.size.koName || '',
                },
            },
            isReviewed: item.isReviewed,
        }));
        this.payments = data.payments ? {
            id: data.payments.id,
            price: data.payments.price,
            status: data.payments.status,
            createdAt: data.payments.createdAt,
            updatedAt: data.payments.updatedAt,
            orderId: data.payments.orderId,
        } : null;            
    }
} 


