import { Request, Response } from 'express';
import * as imageService from '../services/image.service';

export const uploadImage = async (req: Request, res: Response) => {
  // 서비스에서 url과 key를 받아옴
  const { url, key } = await imageService.uploadImage(req.file);

  res.status(201).json({
    message: '업로드 성공',
    url: url,
    key: key,
  });
};
