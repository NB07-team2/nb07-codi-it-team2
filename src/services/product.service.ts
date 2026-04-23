import prisma from '../utils/prismaClient.util';
import { ProductRepository } from '../repositories/product.repository';
import * as imageService from './image.service';
import { ConflictError, NotFoundError, ForbiddenError } from '../errors/errors';
import { ProductResponseDto } from '../models/product.model';
import {
  CreateProductDTO,
  GetProductsQuery,
  UpdateProductDTO,
} from '../structs/product.struct';
import { UserType, ProductCategoryName } from '@prisma/client';
import { ProductWithRelations } from '../types/product.type';
import { DEFAULT_IMAGE } from '../utils/constants.util';

// 새 상품 등록
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

  let finalList = [...list];

  // 별점순 정렬 로직 ( 전체 데이터를 정렬 후 페이징 )
  if (query.sort === 'highRating') {
    // 전체 데이터를 평점순으로 정렬
    finalList.sort((a, b) => {
      const getAvg = (p: ProductWithRelations) => {
        if (p.reviews.length === 0) return 0;
        return (
          p.reviews.reduce((acc, cur) => acc + cur.rating, 0) / p.reviews.length
        );
      };
      // 평점이 같으면 최신순 정렬
      const avgDiff = getAvg(b) - getAvg(a);
      if (avgDiff === 0) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return avgDiff;
    });

    // 정렬 후, 요청한 페이지에 맞게 배열 자르기
    const startIndex = (query.page - 1) * query.pageSize;
    const endIndex = startIndex + query.pageSize;
    finalList = finalList.slice(startIndex, endIndex);
  }

  return { list: finalList, totalCount };
};

// 상품 수정
export const updateProduct = async (
  userId: string,
  userType: UserType,
  productId: string,
  data: UpdateProductDTO,
  file?: Express.Multer.File,
) => {
  // 권한 확인
  if (userType !== 'SELLER')
    throw new ForbiddenError('판매자만 상품을 수정할 수 있습니다.');

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product) throw new NotFoundError('상품을 찾을 수 없습니다.');
  if (product.store.userId !== userId)
    throw new ForbiddenError('자신의 스토어 상품만 수정할 수 있습니다.');

  const updateFields: UpdateProductDTO & {
    categoryId?: string;
    image?: string;
  } = { ...data };
  let stocksMap: { sizeId: number; quantity: number }[] | undefined = undefined;

  // 카테고리 변경
  if (data.categoryName) {
    const category = await prisma.productCategory.findUnique({
      where: { name: data.categoryName as ProductCategoryName },
    });
    if (!category) throw new NotFoundError('해당 카테고리를 찾을 수 없습니다.');
    updateFields.categoryId = category.id;
  }

  // 이미지 변경
  if (file) {
    if (product.image && product.image !== DEFAULT_IMAGE) {
      try {
        await imageService.deleteFromS3(product.image);
        console.log(`기존 상품 이미지 S3 삭제 완료: ${product.image}`);
      } catch (error) {
        console.error('기존 상품 이미지 S3 삭제 중 오류 발생:', error);
      }
    }
    const uploadResult = await imageService.uploadImage(file);
    updateFields.image = uploadResult.url;
  }

  // 재고 변경
  if (data.stocks) {
    const sizes = await prisma.size.findMany();

    stocksMap = data.stocks.map((stock) => {
      const sizeRecord = sizes.find((s) => s.name === stock.size);

      if (!sizeRecord) {
        throw new NotFoundError(`사이즈(${stock.size}) 없음`);
      }

      return {
        sizeId: sizeRecord.id,
        quantity: stock.quantity,
      };
    });
  }

  const updatedProduct = await prisma.$transaction(async (tx) => {
    return await ProductRepository.update(
      tx,
      productId,
      updateFields,
      stocksMap,
    );
  });

  return new ProductResponseDto(updatedProduct as ProductWithRelations);
};

// 상품 상세 조회
export const getProductDetail = async (productId: string) => {
  const product = await ProductRepository.findById(productId);

  if (!product) {
    throw new NotFoundError('요청하신 상품을 찾을 수 없습니다.');
  }

  return new ProductResponseDto(product as ProductWithRelations);
};

// 상품 삭제
export const deleteProduct = async (
  userId: string,
  userType: UserType,
  productId: string,
) => {
  if (userType !== 'SELLER') {
    throw new ForbiddenError('판매자만 상품을 삭제할 수 있습니다.');
  }
  const product = await ProductRepository.findById(productId);

  if (!product) {
    throw new NotFoundError('요청하신 상품을 찾을 수 없습니다.');
  }

  if (product.store.userId !== userId) {
    throw new ForbiddenError('자신의 스토어 상품만 삭제할 수 있습니다.');
  }

  const imageToDelete = product.image;

  await ProductRepository.delete(productId);

  if (imageToDelete && imageToDelete !== DEFAULT_IMAGE) {
    try {
      await imageService.deleteFromS3(imageToDelete);
      console.log(`상품 삭제에 따른 S3 이미지 삭제 완료: ${imageToDelete}`);
    } catch (error) {
      console.error('상품 삭제 중 S3 이미지 삭제 오류 발생:', error);
    }
  }
  return { message: '상품이 삭제되었습니다.' };
};
