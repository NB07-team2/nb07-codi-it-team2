import { Inquiry } from '@prisma/client';
import { InquiryCreateInput, InquiryUpdateInput } from '../structs/inquiry.struct';
import { InquiryDeleteItem, InquiryDetailItem, InquiryMyListItem, InquiryUpdateItem } from '../types/inquiry.type';

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
    isSecret: boolean;
    status: string;
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
    content: string;
    createdAt: Date;
    constructor(data: InquiryMyListItem)  {
      this.id = data.id;
      this.title = data.title;   
      this.isSecret = data.isSecret;
      this.status = data.status;
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
      this.content = data.content;   
      this.createdAt = data.createdAt;

    }
  }

   export class InquiryDetailResponseDto {
    id: string;
    userId: string;
    productId: string;
    title: string;
    content: string;
    status: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
    reply: {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string;
      }
    } | null;

    constructor(data: InquiryDetailItem)  {
      this.id = data.id;
      this.userId = data.userId;
      this.productId = data.productId;
      this.title = data.title;
      this.content = data.content;      
      this.isSecret = data.isSecret;
      this.status = data.status;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;      
      this.reply = data.reply ? {
        id: data.reply.id,
        content: data.reply.content,
        createdAt: data.reply.createdAt,
        updatedAt: data.reply.updatedAt,
        user: {
          id: data.reply.user.id,
          name: data.reply.user.name,
        },
      } : null;
    }
  }

  export class UpdateInquiryDto {
    title?: string;
    content?: string;
    isSecret?: boolean;
    
    constructor(data:InquiryUpdateInput) {
      this.title = data.title;
      this.content = data.content;
      this.isSecret = data.isSecret; 
    }
} 


export class InquiryUpdateResponseDto {
    id: string;
    userId: string;
    productId: string;
    title: string;
    content: string;
    status: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: InquiryUpdateItem)  {
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

  export class InquiryDeleteResponseDto {
    id: string;
    userId: string;
    productId: string;
    title: string;
    content: string;
    status: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
    reply: {
      id: string;
      content: string;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string;
      }
    } | null;

    constructor(data: InquiryDeleteItem)  {
      this.id = data.id;
      this.userId = data.userId;
      this.productId = data.productId;
      this.title = data.title;
      this.content = data.content;      
      this.isSecret = data.isSecret;
      this.status = data.status;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;      
      this.reply = data.reply ?{
        id: data.reply.id,
        content: data.reply.content,
        createdAt: data.reply.createdAt,
        updatedAt: data.reply.updatedAt,
        user: {
          id: data.reply.user.id,
          name: data.reply.user.name,
        },
      } : null;
    }
  }