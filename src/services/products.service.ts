import { InquiryCreateInput } from '../structs/inquiry.schema.struct';
import {CreateInquiryDto,InquiryResponseDto} from '../models/inquiry.model';
import * as productsRepository from '../repositories/products.repository';
import { NotFoundError } from '../errors/errors';

export async function createInquiry(data: InquiryCreateInput) {
    const dto = new CreateInquiryDto(data);
    const existingProduct = await productsRepository.getProductById(dto.productId); 
    if(!existingProduct) {
        throw new NotFoundError('상품을 찾을 수 없습니다');
    }    
    const createdInquiry = await productsRepository.createInquiry(
        {
            title: dto.title,
            content: dto.content,
            isSecret: dto.isSecret,
            userId: dto.userId, 
            productId: existingProduct.id
        },
    );
    return new InquiryResponseDto(createdInquiry);
}   