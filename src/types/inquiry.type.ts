import {
  getInquiriesMyListStruct,
} from '../structs/inquiry.struct';

import { Infer } from 'superstruct';

export interface CreateInquiryRepoDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
}

export interface UpdateInquiryRepoDto {
    title?: string;
    content?: string;
    isSecret?: boolean;
}

export type PaginationMyListParams = Infer<typeof getInquiriesMyListStruct>;

export type InquiryStatus = 'WaitingAnswer' | 'CompletedAnswer';

export type InquiryMyPagingRepoParams = PaginationMyListParams;
export type InquiryMyPagingServiceParams = PaginationMyListParams;

export interface InquiryMyListItem {
    id: string;
    title: string;
    isSecret: boolean;
    status: string;
    product: {
        id: string;
        name: string;
        image: string | null;
        store: {
            id: string;
            name: string;
        };
    };
    user: {
        id: string;
        name: string;
    };
     content: string;
    createdAt: Date;

}

export interface InquiryDetailItem {
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
        id:string;
        name: string;
      };
    } | null;
} 

export interface InquiryUpdateItem {
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
        id:string;
        name: string;
      };
    } | null;
} 

export interface InquiryDeleteItem {
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
        id:string;
        name: string;
      };
    } | null;
} 