import { InquiryCreateInput } from '../structs/inquiry.schema.struct';
import { CreateInquiryDto } from '../models/inquiry.request.model';
import {InquiryResponseDto} from '../models/inquiry.response.model';
import * as inquiryRepository from '../repositories/inquiry.repository';
import { NotFoundError } from '../errors/errors';
export async function createInquiry(data: InquiryCreateInput) {
    const dto = new CreateInquiryDto({ title: data.title, content: data.content, isSecret: data.isSecret, userId: data.userId, productId: data.productId });
    const existingUser = await inquiryRepository.getUserById(dto.userId); // 실제로는 인증된 사용자 ID를 가져와야 합니다.
    const existingProduct = await inquiryRepository.getProductById(dto.productId); // 실제로는 문의 대상 상품 ID를 가져와야 합니다.
    
    if(!existingProduct) {
        throw new NotFoundError('Product not found');
    }
    if(!existingUser) {
        throw new NotFoundError('User not found');
    }
    
    const createdInquiry = await inquiryRepository.createInquiry(
        {
            title: dto.title,
            content: dto.content,
            isSecret: dto.isSecret,
            userId: existingUser.id,
            productId: existingProduct.id
        },
    );
    return new InquiryResponseDto({
        id: createdInquiry.id,
        userId: createdInquiry.userId,
        productId: createdInquiry.productId,
        title: createdInquiry.title,
        content: createdInquiry.content,
        isSecret: createdInquiry.isSecret,
        status: createdInquiry.status,
        createdAt: createdInquiry.createdAt,
        updatedAt: createdInquiry.updatedAt
    });
}   