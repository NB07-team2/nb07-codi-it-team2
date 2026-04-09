import {
  getInquiriesMyListStruct,
} from '../structs/inquiry.schema.struct';

import { Infer } from 'superstruct';

export interface CreateInquiryRepoDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
}

export type PaginationMyListParams = Infer<typeof getInquiriesMyListStruct>;

export type InquiryStatus = 'WaitingAnswer' | 'CompletedAnswer';

export type InquiryMyPagingRepoParams = PaginationMyListParams;
export type InquiryMyPagingServiceParams = PaginationMyListParams;

export interface InquiryMyListItem {
    id: string;
    userId: string;
    title: string;
    content: string;
    isSecret: boolean;
    status: string;
    createdAt: Date;
    updatedAt: Date;
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
}   