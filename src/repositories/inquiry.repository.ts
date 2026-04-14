import { Prisma } from '@prisma/client';
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

    return {
        list: list,
        totalCount : totalCount,
    };      
}

export async function getInquiryDetail(inquiryId: string,userId:string,userType:string) { 

    const whereCondition: Prisma.InquiryWhereInput = {
        id: inquiryId,
    };

    // 2. userType에 따라 조건만 추가 (이미 객체가 존재하므로 필드만 할당)
    if (userType === 'SELLER') {
        whereCondition.product = {
            store: {
                userId: userId,
            },
        };
    } else {
        whereCondition.userId = userId;
    }
    const inquiry = await prisma.inquiry.findFirst({
        where: whereCondition,
        include: {
            reply: {
                select: { id: true, content: true, createdAt: true, updatedAt: true,
                user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });
    return inquiry; 
}   