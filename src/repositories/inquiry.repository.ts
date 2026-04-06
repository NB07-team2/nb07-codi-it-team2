import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
        include: {
            user: true, // 문의 작성자 정보 포함
            product: true, // 문의 대상 상품 정보 포함
        },     
    }); 
  
  return newInquiry; // 생성된 문의 반환
}

export async function getProductById(id: string) {
    const product = await prisma.product.findUnique({
        where: {
            id: id,
        },   
    });
    return product;
}
export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },   
    });
    return user;
}   