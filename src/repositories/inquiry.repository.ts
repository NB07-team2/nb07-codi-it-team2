import { InquiriesMyListResponseDto } from '../models/inquiry.model';
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
                userId: userId,
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
    
    const inquiries = list.map(item => new InquiriesMyListResponseDto(item));
    return {
        list: inquiries,
        totalCount : totalCount,
    };      
}