import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { getOrdersMyListStruct, orderCreateSchema, orderIdSchema } from '../structs/order.struct';
import { create } from 'superstruct';

export async function createOrder(req: Request, res: Response) {
    const {id: userId, type: userType} = req.user!;
    const validatedData = orderCreateSchema.parse({...req.body,
    userId: userId    
    });
    const createdOrder = await orderService.createOrder(validatedData, userId, userType);
    res.status(201).json(createdOrder);
}

export async function getOrderMyList(req: Request, res: Response) {
    const {id: userId, type: userType} = req.user!;
    const ordersListParams = create(req.query, getOrdersMyListStruct);
    const orderListData = await orderService.getOrderMyList(ordersListParams, userId, userType);
    res.status(200).json(orderListData);
}

export async function getOrderDetail(req: Request, res: Response) {
    const {id: userId, type: userType} = req.user!;
    const {id: orderId } = orderIdSchema.parse(req.params);
    const orderDetailData = await orderService.getOrderDetail(orderId, userId, userType);
    res.status(200).json(orderDetailData);
}