import { Inquiry } from '@prisma/client';
import { InquiryCreateInput } from '../structs/inquiry.schema.struct';

export class CreateInquiryDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
    
    constructor(data:InquiryCreateInput) {
      this.title = data.title;
      this.content = data.content;
      this.isSecret = data.isSecret; 
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