export interface CreateCartDto {
    buyerId: string; 
}

export interface SimpleUser {
    id: string;
    type: 'BUYER' | 'SELLER'
}