import { Prisma, UserType } from '@prisma/client';
import {CreateReplyRepoDto, InquiryMyPagingRepoParams,InquiryStatus, UpdateInquiryRepoDto, UpdateReplyRepoDto } from '../types/inquiry.type';
import prisma from '../utils/prismaClient.util';

export async function myInquiryList(params: InquiryMyPagingRepoParams, userId: string, userType: UserType) {
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

export async function getInquiryDetail(inquiryId: string,userId:string,userType:UserType) { 

    const whereCondition: Prisma.InquiryWhereInput = {
        id: inquiryId,
    };

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

export async function getInquiryById(inquiryId: string) {
    return await prisma.inquiry.findUnique({
        where: { id: inquiryId },
    });
}

export async function updateInquiry (inquiryId: string, data: UpdateInquiryRepoDto,userId: string) {
    const existingInquiry = await prisma.inquiry.findFirst({
    where: {
        id: inquiryId,
        userId: userId,
    },
    });
    if (!existingInquiry) {
            return null;
    }
    const updatedInquiry = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
            ...data,
            status: 'WaitingAnswer',
        },
    });
    return updatedInquiry;
}

export async function deleteInquiry (inquiryId: string,userId: string) {
        const existingInquiry = await prisma.inquiry.findFirst({
            where: {
                id: inquiryId,
                userId: userId,
            },
            include: {
                reply: {include: { user:true}}
            },
        });
        if (!existingInquiry) {
            return null;
        }
    return await prisma.inquiry.delete({
        where: { 
            id: inquiryId, 
            userId: userId,
         },
        include: {
            reply: { 
                include: { user: true } 
            }
        },
    });
}

export async function getInquiryStore(inquiryId: string) {  
    return await prisma.inquiry.findUnique({
        where: { id: inquiryId },
        include: {
            product: {
                include: {
                    store: true,
                },
            },
        },
    });
}

export async function createReply(replyData: CreateReplyRepoDto, userId: string) {
    const {inquiryId} = replyData;

    const whereCondition: Prisma.InquiryWhereInput = {
        id: inquiryId,
    };
    whereCondition.product = {
        store: {
            userId: userId,
        },
    }; 
    const existingInquiry = await prisma.inquiry.findFirst({
        where: whereCondition,
    });
    if (!existingInquiry) {
        return null;
    }
    return await prisma.$transaction(async (tx) => {
        const createdReply = await tx.reply.create({
        data: {
            content: replyData.content,
            inquiryId: replyData.inquiryId,
            userId: userId,
        },
    });
    await tx.inquiry.update({
        where: { id: replyData.inquiryId },
        data: { status: 'CompletedAnswer' },
    });
    return createdReply;
    })       
}

export async function updateReply(replyId: string, replyData: UpdateReplyRepoDto) {
    return await prisma.reply.update({
        where: { id: replyId },
        data: { content: replyData.content },
    });
}

export async function getReplyById(replyId: string) {
    return await prisma.reply.findUnique({
        where: { id: replyId },
    });
}