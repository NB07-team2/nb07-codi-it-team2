import * as dashboardRepository from '../repositories/dashboard.repository';
import { startOfDay, subDays, startOfWeek, startOfMonth, startOfYear, endOfDay, subMonths, subYears } from 'date-fns';
import { SimpleUser } from '../types/cart.type';
import { ForbiddenError, NotFoundError } from '../errors/errors';
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
    throw new NotFoundError("스토어가 존재하지 않습니다.");
  }

  const storeId = store.id;
  const now = new Date();

  const [today, week, month, year, topSales, priceRange] = await Promise.all([
    getPeriodData(startOfDay(now), now, startOfDay(subDays(now, 1)), endOfDay(subDays(now, 1)), storeId),
    getPeriodData(startOfWeek(now), now, startOfWeek(subDays(now, 7)), endOfDay(subDays(now, 1)), storeId),
    getPeriodData(startOfMonth(now), now, startOfMonth(subMonths(now, 1)), endOfDay(subDays(now, 1)), storeId),
    getPeriodData(startOfYear(now), now, startOfYear(subYears(now, 1)), endOfDay(subDays(now, 1)), storeId),
    
    dashboardRepository.getTopSalesProducts(storeId),
    dashboardRepository.getPriceRangeStats(storeId),
  ]);

  return { today, week, month, year, topSales, priceRange };
};

async function getPeriodData(currStart: Date, currEnd: Date, prevStart: Date, prevEnd: Date, storeId: string) {
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