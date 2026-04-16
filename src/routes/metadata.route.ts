import { Router } from 'express';
import { getGrades } from '../controllers/metadata.controller';

const router = Router();

//등급 값 조회
router.get('/grade', getGrades);

export default router;
