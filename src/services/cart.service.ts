import { CreateCartDto } from "../types/cart.type";
import * as cartRepository from "../repositories/cart.repository";

export const createCart = async (data: CreateCartDto) => {
    const existingCart = await cartRepository.findByBuyerId(data.buyerId);
    if(existingCart) {
        return existingCart;
    }

    return await cartRepository.createCart(data.buyerId);
};