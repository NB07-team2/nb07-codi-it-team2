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