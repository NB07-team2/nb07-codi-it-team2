import { Request, Response } from 'express';
import * as inquiryService from '../services/inquiry.service';
import { create } from 'superstruct';
import { getInquiriesMyListStruct } from '../structs/inquiry.schema.struct';

export async function myInquiryList(req: Request, res: Response) {
  const { id: userId } = req.user!;
  const inquiriesListParams = create(req.query, getInquiriesMyListStruct);
  const inquiriesData = await inquiryService.myInquiryList(
    { ...inquiriesListParams },
    userId,
  );
  res.status(200).json(inquiriesData);
}
