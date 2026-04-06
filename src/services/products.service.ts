import * as arror from '../errors/errors';
import { ProductRepository } from '../repositories/products.repository';
import { PrismaClient, ProductCategoryName } from '@prisma/client';
import { CreateProductDTO } from '../structs/products.schema.structs';

// 상품등록서비스

export const createProductService = async (prisma: PrismaClient, userId: string, input: CreateProductDTO) => {
    const repository = new ProductRepository(prisma);

    const store = await prisma.store.findUnique({
        where: { userId: userId },
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

    const createInput = {
        name: input.name,
        image: input.image,
        content: input.content,
        price: input.price,
        categoryId: category.id,
        storeId: store.id,
        stocks: input.stocks,
        discountRate: input.discountRate,
        discountStartTime: input.discountStartTime ? new Date(input.discountStartTime) : null,
        discountEndTime: input.discountEndTime ? new Date(input.discountEndTime) : null,
    }
    return repository.createProduct(createInput);
}