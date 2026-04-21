import * as dashboardRepository from '../repositories/dashboard.repository';
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { SimpleUser } from '../types/cart.type';
import { ForbiddenError } from '../errors/errors';
import prisma from '../utils/prismaClient.util';

export const getDashboardStats = async (user: SimpleUser) => {
  if(user.type !== "SELLER") {
    throw new ForbiddenError("접근 권한이 없습니다.");
  }

  const store = await prisma.store.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });

  if (!store) {
    throw new ForbiddenError("스토어가 존재하지 않습니다.");
  }

  const storeId = store.id;

  const now = new Date();

  const [today, week, month, year, topSales, priceRange] = await Promise.all([
    getPeriodData(startOfDay(now), now, startOfDay(subDays(now, 1)), subDays(now, 1), storeId),
    getPeriodData(startOfWeek(now), now, startOfWeek(subDays(now, 7)), subDays(now, 7), storeId),
    getPeriodData(startOfMonth(now), now, startOfMonth(subDays(now, 30)), subDays(now, 30), storeId),
    getPeriodData(startOfYear(now), now, startOfYear(subDays(now, 365)), subDays(now, 365), storeId),
    
    dashboardRepository.getTopSalesProducts(storeId),
    dashboardRepository.getPriceRangeStats(storeId),
  ]);

  return { today, week, month, year, topSales, priceRange };
};

async function getPeriodData(currStart: Date, currEnd: Date, prevStart: Date, prevEnd: Date, storeId) {
  const current = await dashboardRepository.getSalesStats(currStart, currEnd, storeId);
  const previous = await dashboardRepository.getSalesStats(prevStart, prevEnd, storeId);

  const calculateRate = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  return {
    current,
    previous,
    changeRate: {
      totalOrders: calculateRate(current.totalOrders, previous.totalOrders),
      totalSales: calculateRate(current.totalSales, previous.totalSales),
    },
  };
}