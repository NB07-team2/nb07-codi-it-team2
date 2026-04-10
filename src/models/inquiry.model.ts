import { Inquiry } from '@prisma/client';
import { InquiryCreateInput } from '../structs/inquiry.struct';
import { InquiryMyListItem } from '../types/inquiry.type';

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

export class InquiriesMyListResponseDto {
    id: string;
    title: string;
    content: string;
    isSecret: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: string;
      name: string;
      image: string;
      store: {
        id: string;
        name: string;
      };
    };
    user: {
      id: string;
      name: string;
    }
  
    constructor(data: InquiryMyListItem)  {
      this.id = data.id;
      this.title = data.title;
      this.content = data.content;      
      this.isSecret = data.isSecret;
      this.status = data.status;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
      this.product = {
        id: data.product.id,
        name: data.product.name,
        image: data.product.image || '',
        store: {
          id: data.product.store.id,
          name: data.product.store.name,
        },
      };
      this.user = {
        id: data.user.id,
        name: data.user.name,
      };
    }
  }

  export default {CreateInquiryDto, InquiryResponseDto, InquiriesMyListResponseDto};