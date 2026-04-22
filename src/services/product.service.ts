import prisma from '../utils/prismaClient.util';
import { ProductRepository } from '../repositories/product.repository';
import * as imageService from './image.service';
import { ConflictError, NotFoundError, ForbiddenError } from '../errors/errors';
import { ProductResponseDto } from '../models/product.model';
import { CreateProductDTO, GetProductsQuery } from '../structs/product.struct';
import { UserType, ProductCategoryName } from '@prisma/client';
import { ProductWithRelations } from '../types/product.type';

export const createProduct = async (
  userId: string,
  userType: UserType,
  data: CreateProductDTO,
  file?: Express.Multer.File,
) => {
  // 판매자 권한 및 스토어 소유 확인
  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자만 상품을 등록할 수 있습니다.');

  const store = await prisma.store.findUnique({ where: { userId } });
  if (!store) throw new NotFoundError('스토어를 찾을 수 없습니다.');

  const existing = await ProductRepository.findByNameInStore(
    store.id,
    data.name,
  );
  if (existing) throw new ConflictError('이미 상품이 존재합니다.');

  const category = await prisma.productCategory.findUnique({
    where: { name: data.categoryName as ProductCategoryName },
  });
  if (!category) throw new NotFoundError('카테고리가 없습니다.');

  let imageUrl = '';
  if (file) {
    const uploadResult = await imageService.uploadImage(file);
    imageUrl = uploadResult.url;
  }

  // 상품 및 재고 트랜잭션 생성
  const newProduct = await prisma.$transaction(async (tx) => {
    return await ProductRepository.create(
      tx,
      store.id,
      category.id,
      imageUrl,
      data,
    );
  });

  return new ProductResponseDto(newProduct);
};

// 상품 목록 조회
export const getProducts = async (query: GetProductsQuery) => {
  const { list, totalCount } = (await ProductRepository.findAll(query)) as {
    list: ProductWithRelations[];
    totalCount: number;
  };

  if (totalCount === 0) {
    throw new NotFoundError('상품을 찾을 수 없습니다.');
  }

  let finalList = [...list];

  if (query.sort === 'highRating') {
    finalList.sort((a, b) => {
      const calculateAvg = (p: ProductWithRelations) => {
        if (p.reviews.length === 0) return 0;
        const sum = p.reviews.reduce((acc, cur) => acc + cur.rating, 0);
        return sum / p.reviews.length;
      };
      return calculateAvg(b) - calculateAvg(a);
    });
  }

  return { list: finalList, totalCount };
};
