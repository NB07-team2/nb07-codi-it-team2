import { Request, Response } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { create } from 'superstruct';
import { getInquiriesMyListStruct } from '../structs/inquiry.struct';

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
    const inquiryId  = req.params.id as string;
    const { id: userId, type: userType } = req.user!;
    const inquiryDetail = await inquiryService.getInquiryDetail(inquiryId, userId, userType);
    res.status(200).json(inquiryDetail);
} 