import {InquiryMyPagingRepoParams,InquiryStatus } from '../types/inquiry.type';
import prisma from '../utils/prismaClient.util';

export async function myInquiryList(params: InquiryMyPagingRepoParams, userId: string) {
    const { page, pageSize, status} = params;
    const skip = (page - 1) * pageSize; 
    const whereCondition = {
        userId,
        ...(status ? { status: status as InquiryStatus } : {}),
    };
    const [list,totalCount] = await prisma.$transaction([
        prisma.inquiry.findMany({
            where: whereCondition,
            skip: skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { id: true, name: true,image: true, 
                        store: {
                            select: {
                                id: true,
                                name: true,
                            },  
                    },
                },
                },
                user: {
                    select: { id: true, name: true },
                },
            },
        }),
        prisma.inquiry.count({
            where: whereCondition
        }),
    ]);
    
    const inquiries = list.map(inquiry => ({
        id: inquiry.id,
        userId: inquiry.userId,
        title: inquiry.title,
        content: inquiry.content,
        isSecret: inquiry.isSecret,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt,
        product: {
            id: inquiry.product.id,
            name: inquiry.product.name,
            image: inquiry.product.image,
            store: {
                id: inquiry.product.store.id,
                name: inquiry.product.store.name,
            },
        },
        user: {
            id: inquiry.user.id,
            name: inquiry.user.name,
        },
    }));
    return {
        list: inquiries,
        totalCount : totalCount,
    };      
}