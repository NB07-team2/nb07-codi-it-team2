import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as dashboardService from "../services/dashboard.service"

export const getDashboardData = asyncHandler(async (req: Request, res:Response) => {
    const user = req.user!;
    
    const data = await dashboardService.getDashboardStats(user);
    
    res.status(200).json(data);
})