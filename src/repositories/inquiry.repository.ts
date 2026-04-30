import { NotificationType, Prisma, UserType } from '@prisma/client';
import {CreateInquiryRepoDto, CreateReplyRepoDto, InquiryMyPagingRepoParams,InquiryProductPagingRepoParams,InquiryStatus, UpdateInquiryRepoDto, UpdateReplyRepoDto } from '../types/inquiry.type';
import prisma from '../utils/prismaClient.util';


export async function createInquiry(inquiryData : CreateInquiryRepoDto) {
    // 문의 생성

    return await prisma.$transaction(async (tx) => {
        const newInquiry = await tx.inquiry.create({
        data: {
            title: inquiryData.title,
            content: inquiryData.content,
            isSecret: inquiryData.isSecret,
            user: { connect: { id: inquiryData.userId } },
            product: { connect: { id: inquiryData.productId } },
        },   
      });
          //[판매자 알림] 문의가 생성되면 판매자에게 알림을 보내는 로직을 여기에 추가할 수 있습니다.
        await prisma.notification.create({
        data: {
            type: NotificationType.NEW_INQUIRY,
            content: `새로운 문의가 등록되었습니다: ${newInquiry.title}`,
            userId: (await prisma.product.findUnique({
                where: { id: inquiryData.productId },
                select: { store: { select: { userId: true } } },
            }))?.store.userId || '',
        },
        });
        return newInquiry; 
    })
}

export async function getProductById(productId: string) {
    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },   
    });
    return product;
} 

export async function getInquiryList(productId: string, params: InquiryProductPagingRepoParams){
const { page, pageSize, status, sort } = params;
    const where: Prisma.InquiryWhereInput = {
      productId,
      ...(status && { status }),
    };
    const [list, totalCount] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip: (page - 1) * pageSize,
        orderBy: { 
            createdAt: sort === 'oldest' ? 'asc' : 'desc' 
        },
        take: pageSize,
        include: {
            user: {
                select: {name: true },
            },
            reply: {
                select: { id: true,inquiryId: true, userId: true, content: true, createdAt: true, updatedAt: true,
                user: {
                        select: { name: true },
                    },
                },
            },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return { list:list, totalCount: totalCount };
}

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
                    store: {
                        select: {
                            userId: true,
                        },  
                    }     
                },
            },
        },
    });
}

export async function createReply(replyData: CreateReplyRepoDto, userId: string) {

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
    
    //[구매자 알림] 답변이 생성되면 구매자에게 알림을 보내는 로직을 여기에 추가할 수 있습니다.
    const inquiry = await tx.inquiry.findUnique({
        where: { id: replyData.inquiryId },
        include: {
            user: {
                select: { id: true },
            },
        },
    });

    if (inquiry?.user) {
        await tx.notification.create({
            data: {
                type: NotificationType.INQUIRY_ANSWER,
                content: `'${inquiry.title}' 문의에 대한 새로운 답변이 등록되었습니다.`,
                userId: inquiry.user.id,
            },
        });
    }   
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