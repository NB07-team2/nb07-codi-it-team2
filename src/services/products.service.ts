import * as error from '../errors/errors';
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
    throw new error.NotFoundError('해당 사용자의 store을 찾을 수 없습니다.');
  }

  const category = await prisma.productCategory.findUnique({
    where: { name: input.categoryName as ProductCategoryName },
    select: { id: true },
  });

  if (!category) {
    throw new error.NotFoundError('해당 카테고리를 찾을 수 없습니다.');
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
    discountRate: input.discountRate,
    discountStartTime: input.discountStartTime ? new Date(input.discountStartTime) : null,
    discountEndTime: input.discountEndTime ? new Date(input.discountEndTime) : null,
  });

  if (!createdProduct) {
    throw new error.BadRequestError('상품 등록에 실패했습니다.');
  }

  if (typeof input.stocks === 'string') {
    try {
      input.stocks = JSON.parse(input.stocks);
    } catch (err) {
      throw new error.BadRequestError('stocks 파싱 오류.');
    }
  }

  const savedStocks = [];
  for (const stock of input.stocks) {
    const size = await prisma.size.findUnique({
      where: { id: stock.sizeId },
      select: { id: true, name: true },
    });

    if (!size) {
      throw new error.NotFoundError(`Size with id ${stock.sizeId} not found.`);
    }

    const savedStock = await prisma.stock.create({
      data: {
        productId: createdProduct.id,
        sizeId: stock.sizeId,
        quantity: stock.quantity,
      },
    });

    savedStocks.push({
      ...savedStock,
      size,
    });
  }

  return new CreateProductResponseDto({
    ...createdProduct,
    stocks: savedStocks,
  });
};
