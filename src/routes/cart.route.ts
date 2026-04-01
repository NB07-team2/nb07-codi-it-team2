import { Router, Request, Response } from "express";
import { authenticate } from "../middlewares/auth.middlewares";

const router = Router();

// 마지막에 (req, res) => { ... } 를 추가해서 문법을 완성합니다.
router.post('/', authenticate, (req: Request, res: Response) => {
  res.status(200).json({ message: "장바구니 생성 기능 구현 중" });
});

export default router;