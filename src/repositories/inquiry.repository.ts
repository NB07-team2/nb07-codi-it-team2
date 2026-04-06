import prisma from '../utils/prismaClient.util';

export async function createInquiry(inquiryData : { title: string; content: string; isSecret?: boolean; userId: string; productId: string }) {
    // 문의 생성
    const newInquiry = await prisma.inquiry.create({
        data: {
            title: inquiryData.title,
            content: inquiryData.content,
            isSecret: inquiryData.isSecret || false,
            user: { connect: { id: inquiryData.userId } },
            product: { connect: { id: inquiryData.productId } },
        },   
    }); 
  
  return newInquiry; // 생성된 문의 반환
}

export async function getProductById(poductId: string) {
    const product = await prisma.product.findUnique({
        where: {
            id: poductId,
        },   
    });
    return product;
}
export async function getUserById(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },   
    });
    return user;
}   