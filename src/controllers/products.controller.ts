import { Request, Response } from 'express';
import * as productsService from '../services/products.service';  
import { inquiryCreateSchema } from '../structs/inquiry.schema.struct';

export async function createInquiry(req:Request, res: Response) {
   const productId = req.params.productId; // URL에서 productId를 가져옵니다.
   const { id: userId } = req.user!; 
    const dateToValidate = {
    ...req.body,
    productId: productId, // URL에서 가져온 productId를 포함
    userId: userId // 인증된 사용자 ID를 포함    
   };
   const valiedData = inquiryCreateSchema.parse(dateToValidate); // Zod를 사용하여 데이터 검증
   const newInquiry = await productsService.createInquiry(valiedData); // 실제로는 인증된 사용자 ID와 문의 대상 상품 ID를 가져와야 합니다.
   res.status(201).json(newInquiry);
}   