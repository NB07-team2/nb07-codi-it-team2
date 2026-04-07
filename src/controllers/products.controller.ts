import { Request, Response } from 'express';
import * as productsService from '../services/products.service';  
import { inquiryCreateSchema } from '../structs/inquiry.schema.struct';

export async function createInquiry(req:Request, res: Response) {
   const productId = req.params.productId;
   const { id: userId } = req.user!; 
    const dateToValidate = {
    ...req.body,
    productId: productId, 
    userId: userId    
   };
   const validatedData = inquiryCreateSchema.parse(dateToValidate); 
   const newInquiry = await productsService.createInquiry(validatedData); 
   res.status(201).json(newInquiry);
}   