import * as inquiryRepository from '../repositories/inquiry.repository';
import {InquiriesMyListResponseDto } from '../models/inquiry.model';
export async function myInquiryList(params: { page: number; pageSize: number; status?: 'WaitingAnswer' | 'CompletedAnswer' }, userId: string, userType: string) {
    const { page, pageSize, status } = params;
    const inquiriesData = await inquiryRepository.myInquiryList({ page, pageSize, status }, userId,userType);
    return {
        list: inquiriesData.list.map(item => new InquiriesMyListResponseDto(item)),
        totalCount: inquiriesData.totalCount,
    };  
}       