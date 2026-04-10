import {InquiryMyPagingRepoParams,InquiryStatus } from '../types/inquiry.type';
import prisma from '../utils/prismaClient.util';

export async function myInquiryList(params: InquiryMyPagingRepoParams, userId: string, userType: string) {
    const { page, pageSize, status} = params;
    const skip = (page - 1) * pageSize; 

    const whereCondition: any = {
        ...(status ? { status: status as InquiryStatus } : {}),
    };
    if (userType === 'SELLER') {
        whereCondition.product = {
            store: {
                id: userId,
            },
        };
    }else{
        whereCondition.userId = userId;
    }

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
        title: inquiry.title,
        isSecret: inquiry.isSecret,
        status: inquiry.status,
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
        content: inquiry.content,
        createdAt: inquiry.createdAt,
    }));
    return {
        list: inquiries,
        totalCount : totalCount,
    };      
}