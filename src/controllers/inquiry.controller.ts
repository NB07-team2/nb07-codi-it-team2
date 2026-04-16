import { Request, Response } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { create } from 'superstruct';
import { getInquiriesMyListStruct, inquiryIdSchema, inquiryUpdateSchema } from '../structs/inquiry.struct';

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
    const { id: userId, type: userType } = req.user!;
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