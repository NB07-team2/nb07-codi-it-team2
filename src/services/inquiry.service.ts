import * as inquiryRepository from '../repositories/inquiry.repository';
import {InquiriesMyListResponseDto, InquiryDeleteResponseDto, InquiryDetailResponseDto, InquiryUpdateResponseDto, ReplyResponseDto, UpdateInquiryDto } from '../models/inquiry.model';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors/errors';
import { InquiryUpdateInput, ReplyCreateInput, ReplyUpdateInput } from '../structs/inquiry.struct';
import { InquiryStatus, UserType } from '@prisma/client';
export async function myInquiryList(params: { page: number; pageSize: number; status?: InquiryStatus }, userId: string, userType: UserType) {
    const { page, pageSize, status } = params;
    const inquiriesData = await inquiryRepository.myInquiryList({ page, pageSize, status }, userId,userType);
    return {
        list: inquiriesData.list.map(item => new InquiriesMyListResponseDto(item)),
        totalCount: inquiriesData.totalCount,
    };  
}

export async function getInquiryDetail(inquiryId: string, userId: string,userType: UserType) {  
    const existingInquiry = await inquiryRepository.getInquiryDetail(inquiryId, userId, userType);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    return new InquiryDetailResponseDto(existingInquiry);
}

export async function updateInquiry (inquiryId: string, userId: string, updateData:InquiryUpdateInput, userType: UserType) {
    if(userType !== "BUYER"){
        throw new ForbiddenError('구매자만 문의를 수정할 수 있습니다.');
    }
    const dto = new UpdateInquiryDto(updateData);

    const existingInquiry = await inquiryRepository.getInquiryById(inquiryId);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    if( existingInquiry.userId !== userId) {
        throw new ForbiddenError('문의 작성자만 수정할 수 있습니다.');
    }
    if (existingInquiry.status === 'CompletedAnswer') {
        throw new ForbiddenError('답변이 완료된 문의는 수정할 수 없습니다.');
    }
    const updatedInquiry = await inquiryRepository.updateInquiry(inquiryId, dto, userId);
    if (!updatedInquiry) {
        throw new NotFoundError('문의 수정에 실패하였습니다.');
    }
    return new InquiryUpdateResponseDto(updatedInquiry);

}

export async function deleteInquiry(inquiryId: string, userId: string, userType: UserType) {
    if(userType !== "BUYER"){
        throw new ForbiddenError('구매자만 문의를 삭제할 수 있습니다.');
    }
    const existingInquiry = await inquiryRepository.getInquiryById(inquiryId);
    if (!existingInquiry) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    if(existingInquiry.userId !== userId) {
        throw new ForbiddenError('문의 작성자만 삭제할 수 있습니다.');
    }
    const deletedInquiry = await inquiryRepository.deleteInquiry(inquiryId, userId);

    if (!deletedInquiry) {
        throw new NotFoundError('문의 삭제에 실패하였습니다.');
    }
    return new InquiryDeleteResponseDto(deletedInquiry);
} 

export async function createReply(insertData: ReplyCreateInput,userType: UserType, userId: string) {
    if(userType !== "SELLER"){
        throw new ForbiddenError('판매자만 답변을 등록할 수 있습니다.');
    }
    // 답변등록전 해당문의가 해당 판매자의 스토어에 속한 문의인지
    const inquiryStore = await inquiryRepository.getInquiryStore(insertData.inquiryId);
    if (!inquiryStore) {
        throw new NotFoundError('문의가 존재하지 않습니다.');
    }
    if (inquiryStore.product.store.userId !== userId) {
        throw new ForbiddenError('해당 문의는 판매자의 스토어에 속하지 않습니다.');
    }
    if (inquiryStore.status === 'CompletedAnswer') {
        throw new ConflictError('이미 답변이 등록된 문의입니다.');
    }
    const createdReply = await inquiryRepository.createReply(insertData, userId);
    if (!createdReply) {
        throw new NotFoundError('답변 생성에 실패하였습니다.');
    }
    return new ReplyResponseDto(createdReply);
}


export async function updateReply(replyId: string, replyData: ReplyUpdateInput, userType: UserType, userId: string) {
    if(userType !== "SELLER"){
        throw new ForbiddenError('판매자만 답변을 수정할 수 있습니다.');
    }
    const existingReply = await inquiryRepository.getReplyById(replyId);
    if (!existingReply) {
        throw new NotFoundError('답변이 존재하지 않습니다.');
    }
    if(existingReply.userId !== userId) {
        throw new ForbiddenError('답변 작성자만 수정할 수 있습니다.');
    }
    const updatedReply = await inquiryRepository.updateReply(replyId, replyData);
    if (!updatedReply) {
        throw new NotFoundError('답변 수정에 실패하였습니다.');
    }
    return new ReplyResponseDto(updatedReply);
}