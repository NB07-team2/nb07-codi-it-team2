import { InquiryCreateInput } from '../structs/inquiry.schema.struct';
import {CreateInquiryDto,InquiryResponseDto} from '../models/inquiry.model';
import * as productsRepository from '../repositories/products.repository';
import { NotFoundError } from '../errors/errors';

export async function createInquiry(data: InquiryCreateInput) {
    const dto = new CreateInquiryDto(data as unknown as CreateInquiryDto);
    const existingProduct = await productsRepository.getProductById(dto.productId); // 실제로는 문의 대상 상품 ID를 가져와야 합니다.
    if(!existingProduct) {
        throw new NotFoundError('상품을 찾을 수 없습니다');
    }    
    const createdInquiry = await productsRepository.createInquiry(
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