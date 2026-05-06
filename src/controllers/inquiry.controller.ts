import { Request, Response } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { create } from 'superstruct';
import { getInquiriesMyListStruct, getInquiriesProductListStruct, inquiryCreateSchema, inquiryIdSchema, inquiryUpdateSchema, replyCreateSchema, replyIdSchema, replyUpdateSchema } from '../structs/inquiry.struct';
import { productIdParamSchema } from '../structs/product.struct';

export async function createInquiry(req:Request, res: Response) {
   const productId = req.params.productId;
   const { id: userId } = req.user!; 

   const dateToValidata = {
    ...req.body,
    productId: productId, 
    userId: userId    
   };
   const validatedData = inquiryCreateSchema.parse(dateToValidata); 
   const newInquiry = await inquiryService.createInquiry(validatedData); 
   res.status(201).json(newInquiry);
}  

export async function getInquiryList(req: Request, res: Response) {
    const { productId } = productIdParamSchema.parse(req.params);
    const inquiriesListParams = create(req.query, getInquiriesProductListStruct);
    const inquiriesData = await inquiryService.getInquiryList(productId, inquiriesListParams);
    res.status(200).json(inquiriesData);
}   

export async function myInquiryList(req: Request, res: Response) {
  const { id: userId , type: userType } = req.user!
  const inquiriesListParams = create(req.query, getInquiriesMyListStruct);
  const inquiriesData = await inquiryService.myInquiryList(
    { ...inquiriesListParams },
    userId,
    userType
  );
  res.status(200).json(inquiriesData);
}

export async function getInquiryDetail(req: Request, res: Response) {
    const {id:inquiryId} = inquiryIdSchema.parse(req.params);
    const {id: userId, type: userType } = req.user!;
    const inquiryDetail = await inquiryService.getInquiryDetail(inquiryId, userId, userType);
    res.status(200).json(inquiryDetail);
} 

export async function updateInquiry(req: Request, res: Response) {
    const {id:inquiryId} = inquiryIdSchema.parse(req.params);
    const { id: userId, type: userType } = req.user!;
    const validatedData = inquiryUpdateSchema.parse(req.body); 
    const updatedInquiry = await inquiryService.updateInquiry(inquiryId, userId, validatedData, userType);
    res.status(200).json(updatedInquiry);
} 

export async function deleteInquiry(req: Request, res: Response) {
    const {id:inquiryId} = inquiryIdSchema.parse(req.params);
    const { id: userId, type: userType } = req.user!;
    const deletedInquiry = await inquiryService.deleteInquiry(inquiryId, userId, userType);
    res.status(200).json(deletedInquiry);
}

export async function createReply(req: Request, res: Response) {  
    const { id: inquiryId } = inquiryIdSchema.parse(req.params);
    const { id: userId , type: userType } = req.user!
    const dateToValidate = {
    ...req.body,
    inquiryId: inquiryId, 
    userId: userId    
   };
    const validatedData = replyCreateSchema.parse(dateToValidate);
    const createdReply = await inquiryService.createReply(validatedData, userType, userId);
    res.status(201).json(createdReply);
}

export async function updateReply(req: Request, res: Response) {
    const { id: replyId } = replyIdSchema.parse(req.params);
    const { id: userId , type: userType } = req.user!
    const validatedData = replyUpdateSchema.parse(req.body);
    const updatedReply = await inquiryService.updateReply(replyId, validatedData, userType, userId);
    res.status(200).json(updatedReply);
} 