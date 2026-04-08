export interface CreateInquiryRepoDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
}