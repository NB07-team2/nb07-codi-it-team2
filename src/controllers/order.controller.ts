import { Request, Response } from 'express';
import * as orderService from '../services/order.service';
import { orderCreateSchema } from '../structs/order.struct';

export async function createOrder(req: Request, res: Response) {
    const {id: userId, type: userType} = req.user!;
    const validatedData = orderCreateSchema.parse({...req.body,
    userId: userId    
    });
    const createdOrder = await orderService.createOrder(validatedData, userId, userType);
    res.status(201).json(createdOrder);
}