import { Inquiry } from '@prisma/client';
import { InquiryCreateReqDto } from '../types/inquiry.type';
export class CreateInquiryDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
    
    constructor(data:InquiryCreateReqDto) {
      this.title = data.title;
      this.content = data.content;
      this.isSecret = data.isSecret || false; // isSecret이 제공되지 않으면 기본값으로 false 설정
      this.userId = data.userId;
      this.productId = data.productId;
    }
  }



export class InquiryResponseDto {
    id: string;
    userId: string;
    productId: string;
    title: string;
    content: string;
    isSecret: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  
    constructor(data: Inquiry)  {
      this.id = data.id;
      this.userId = data.userId;
      this.productId = data.productId;
      this.title = data.title;
      this.content = data.content;      
      this.isSecret = data.isSecret;
      this.status = data.status;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
    }
  } 

  export default {CreateInquiryDto, InquiryResponseDto};