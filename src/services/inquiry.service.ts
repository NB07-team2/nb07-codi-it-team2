import * as inquiryRepository from '../repositories/inquiry.repository';
import {InquiriesMyListResponseDto, InquiryDetailResponseDto } from '../models/inquiry.model';
import { NotFoundError } from '../errors/errors';

export async function myInquiryList(params: { page: number; pageSize: number; status?: 'WaitingAnswer' | 'CompletedAnswer' }, userId: string, userType: string) {
    const { page, pageSize, status } = params;
    const inquiriesData = await inquiryRepository.myInquiryList({ page, pageSize, status }, userId,userType);
    return {
        list: inquiriesData.list.map(item => new InquiriesMyListResponseDto(item)),
        totalCount: inquiriesData.totalCount,
    };  
}

export async function getInquiryDetail(inquiryId: string, userId: string,userType: string) {  
    const existingInquiry = await inquiryRepository.getInquiryDetail(inquiryId, userId, userType);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    return new InquiryDetailResponseDto(existingInquiry);
}       