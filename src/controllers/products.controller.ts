import { Request, Response } from 'express';
import { createProductService } from '../services/products.service';
import { createProductbody } from '../structs/products.schema.structs';


// 상품 등록
export const createProductController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const validatedProduct = createProductbody.parse(req.body);
  const created = await createProductService(userId, validatedProduct);

    res.status(201).json(created);
  };

