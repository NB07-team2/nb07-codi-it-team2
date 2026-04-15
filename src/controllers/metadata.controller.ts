import { Request, Response } from 'express';
import { getAllGrades } from '../services/metadata.service';
import { asyncHandler } from '../utils/asyncHandler.util';

export const getGrades = asyncHandler(async (_req: Request, res: Response) => {
  const grades = await getAllGrades();
  res.status(200).json(grades);
});
