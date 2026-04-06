import { InquiryCreateInput } from '../structs/inquiry.schema.struct';
import { CreateInquiryDto } from '../models/inquiry.request.model';
import {InquiryResponseDto} from '../models/inquiry.response.model';
import * as inquiryRepository from '../repositories/inquiry.repository';
import { NotFoundError } from '../errors/errors';

export async function createInquiry(data: InquiryCreateInput) {
    const dto = new CreateInquiryDto(data);
    const existingProduct = await inquiryRepository.getProductById(dto.productId); // 실제로는 문의 대상 상품 ID를 가져와야 합니다.
    
    if(!existingProduct) {
        throw new NotFoundError('Product not found');
    }    
    const createdInquiry = await inquiryRepository.createInquiry(
        {
            title: dto.title,
            content: dto.content,
            isSecret: dto.isSecret,
            userId: dto.userId, // 실제로는 인증된 사용자 ID를 가져와야 합니다.
            productId: existingProduct.id
        },
    );
    return new InquiryResponseDto(createdInquiry);
}   