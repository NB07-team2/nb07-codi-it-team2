import * as arror from '../errors/errors';
import { ProductRepository } from '../repositories/products.repository';
import { ProductCategoryName } from '@prisma/client';
import { CreateProductDTO } from '../structs/products.schema.structs';
import { CreateProductResponseDto } from '../models/product.model';
import prisma from '../utils/prismaClient.util';
import * as imageService from './image.service';

// 상품등록서비스

export const createProductService = async (
  userId: string,
  input: CreateProductDTO,
  file?: Express.Multer.File,
) => {
  const store = await prisma.store.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!store) {
    throw new arror.NotFoundError('해당 사용자의 store을 찾을 수 없습니다.');
  }

  const category = await prisma.productCategory.findUnique({
    where: { name: input.categoryName as ProductCategoryName },
    select: { id: true },
  });

  if (!category) {
    throw new arror.NotFoundError('해당 카테고리를 찾을 수 없습니다.');
  }

  const existingProduct = await prisma.product.findFirst({
    where: { name: input.name },
  });

  if (existingProduct) {
    throw new arror.ConflictError('이미 존재하는 상품명입니다.');
  }

  let discountStartTime = input.discountStartTime ? new Date(input.discountStartTime) : null;
  let discountEndTime = input.discountEndTime ? new Date(input.discountEndTime) : null;

  if (input.discountRate) {
    if (input.discountRate < 0 || input.discountRate > 100) {
      throw new arror.BadRequestError('할인율은 0에서 100 사이여야 합니다.');
    }

    if (discountStartTime && discountEndTime) {
      if (discountStartTime >= discountEndTime) {
        throw new arror.BadRequestError('할인 종료 시간은 시작 시간보다 빨라야 합니다.');
        }
    }
  }

  let imageUrlString = '';
  if (file) {
    const uploadResult = await imageService.uploadImage(file);
    imageUrlString = uploadResult.url;
  }

  const createdProduct = await ProductRepository.createProduct({
    name: input.name,
    image: imageUrlString,
    content: input.content,
    price: input.price,
    categoryId: category.id,
    storeId: store.id,
    stocks: input.stocks,
    discountRate: input.discountRate,
    discountStartTime: discountStartTime,
    discountEndTime: discountEndTime,
  });

  if (!createdProduct) {
    throw new arror.BadRequestError('상품 등록에 실패했습니다.');
  }

  return new CreateProductResponseDto(createdProduct);
};

