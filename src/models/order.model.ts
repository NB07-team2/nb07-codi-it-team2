import { OrderCreateInput } from "../structs/order.struct";
import { OrderCreateItem, OrderMyListItem } from "../types/order.type";

export class CreateOrderDto{
    name: string;
    phone: string;
    address: string;
    orderItems: {
        productId: string;
        sizeId: number;
        quantity: number;
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
        }));
        this.usePoint = data.usePoint || 0;
    }
}

export class OrderResponseDto {
    id: string;
    name: string;
    phoneNumber: string; // phoneNumber로 변경이 필요할 수 있으나, 
                   // 현재 클래스 프로퍼티 정의에 맞춰 작성합니다.
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
            image: string;
            reviews: {
                id: string;
                rating: number;
                content: string;
                createdAt: Date;
            }[];
        };
        size: {
            id: number;
            size: {
                en: string | null;
                ko: string | null;
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
        this.phoneNumber = data.phone; // OrderCreateItem에서는 phone로 정의되어 있으므로 그대로 사용
        this.address = data.address;
        this.subtotal = data.subtotal;
        this.totalQuantity = data.totalQuantity;
        this.usePoint = data.usePoint;
        this.createdAt = data.createdAt;
        
        // map 내부 수정
        this.orderItems = data.orderItems.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
            product: {
                name: item.product.name,
                image: item.product.image || '',
                // reviews가 없으면 빈 배열([]) 반환
                reviews: item.product.reviews?.map(review => ({
                    id: review.id,
                    rating: review.rating,
                    content: review.content,
                    createdAt: review.createdAt,
                })) || [], 
            },
            size: {
                id: item.size.id,
                size: {
                    // item.size에 직접 값이 들어있으므로 타입에 맞춰 할당
                    en: item.size.enName || '',
                    ko: item.size.koName || '',
                },
            },
            // 이미 OrderCreateItem에서 boolean으로 정의되어 있으므로 그대로 사용
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

export class OrderMyListResponseDto {
    id: string;
    name: string;
    phoneNumber: string; 
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
            image: string;
            reviews: {
                id: string;
                rating: number;
                content: string;
                createdAt: Date;
            }[];
        };
        size: {
            id: number;
            size: {
                en: string | null;
                ko: string | null;
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

    constructor(data: OrderMyListItem) {
        this.id = data.id;
        this.name = data.name;
        this.phoneNumber = data.phone;
        this.address = data.address;
        this.subtotal = data.subtotal;
        this.totalQuantity = data.totalQuantity;
        this.usePoint = data.usePoint;
        this.createdAt = data.createdAt;
        
        // map 내부 수정
        this.orderItems = data.orderItems.map(item => ({
            id: item.id,
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
            product: {
                name: item.product.name,
                image: item.product.image || '',
                reviews: item.product.reviews?.map(review => ({
                    id: review.id,
                    rating: review.rating,
                    content: review.content,
                    createdAt: review.createdAt,
                })) || [], 
            },
            size: {
                id: item.size.id,
                size: {
                    en: item.size.enName || '',
                    ko: item.size.koName || '',
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