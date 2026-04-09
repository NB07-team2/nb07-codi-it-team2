import * as inquiryRepository from '../repositories/inquiry.repository';
import {InquiriesMyListResponseDto } from '../models/inquiry.model';
export async function myInquiryList(params: { page: number; pageSize: number; status?: 'WaitingAnswer' | 'CompletedAnswer' }, userId: string) {
    const { page, pageSize, status } = params;
    const inquiriesData = await inquiryRepository.myInquiryList({ page, pageSize, status }, userId);
    const inquiriesResponse = inquiriesData.list.map(item => new InquiriesMyListResponseDto(item));
    return {
        list: inquiriesResponse,
        totalCount: inquiriesData.totalCount,
    };  
}       