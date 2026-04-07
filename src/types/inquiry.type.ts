export interface CreateInquiryRepoDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
}
export type InquiryCreateReqDto = {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
}; 