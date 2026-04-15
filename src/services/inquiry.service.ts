import * as inquiryRepository from '../repositories/inquiry.repository';
import {InquiriesMyListResponseDto, InquiryDeleteResponseDto, InquiryDetailResponseDto, InquiryUpdateResponseDto } from '../models/inquiry.model';
import { ForbiddenError, NotFoundError } from '../errors/errors';
import { InquiryUpdateInput } from '../structs/inquiry.struct';
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

export async function updateInquiry (inquiryId: string, userId: string, updateData:InquiryUpdateInput, userType: string) {
    if(userType !== "BUYER"){
        throw new ForbiddenError('구매자만 문의를 수정할 수 있습니다.');
    } 
    const existingInquiry = await inquiryRepository.getInquiryDetail(inquiryId, userId, userType);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    if(!existingInquiry.userId || existingInquiry.userId !== userId) {
        throw new ForbiddenError('문의 작성자만 수정할 수 있습니다.');
    }
    if (existingInquiry.status === 'CompletedAnswer') {
        throw new ForbiddenError('답변이 완료된 문의는 수정할 수 없습니다.');
    }
    const updatedInquiry = await inquiryRepository.updateInquiry(inquiryId, updateData, userId, userType); 
    const result = updatedInquiry as typeof updatedInquiry & { 
        reply?: InquiryUpdateResponseDto['reply'] 
    };
    return new InquiryUpdateResponseDto({ 
        ...result, 
        reply: result.reply ?? existingInquiry.reply ?? null 
    });
}

export async function deleteInquiry(inquiryId: string, userId: string, userType: string) {
    const existingInquiry = await inquiryRepository.getInquiryDetail(inquiryId, userId, userType);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    if (existingInquiry.status === 'CompletedAnswer') {
        throw new ForbiddenError('답변이 완료된 문의는 삭제할 수 없습니다.');
    }
    const deletedInquiry = await inquiryRepository.deleteInquiry(inquiryId, userId, userType);
    const result = deletedInquiry as typeof deletedInquiry & { 
        reply?: InquiryDeleteResponseDto['reply'] 
    };

    return new InquiryDeleteResponseDto({ 
        ...result, 
        reply: result.reply ?? existingInquiry.reply ?? null 
    });
} 
