export class CreateInquiryDto {
    title: string;
    content: string;
    isSecret?: boolean;
    userId: string;
    productId: string;
    
    constructor(data: { title: string; content: string; isSecret?: boolean; userId: string; productId: string }) {
      this.title = data.title;
      this.content = data.content;
      this.isSecret = data.isSecret || false; // isSecret이 제공되지 않으면 기본값으로 false 설정
      this.userId = data.userId;
      this.productId = data.productId;
    }
  }

  export default CreateInquiryDto;