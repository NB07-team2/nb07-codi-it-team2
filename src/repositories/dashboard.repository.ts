import prisma from '../utils/prismaClient.util';

export const getSalesStats = async (startDate: Date, endDate: Date, storeId: string) => {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: { storeId: storeId },
      order: {
        createdAt: { gte: startDate, lte: endDate },
      },
    },
    select: {
      price: true,
      quantity: true,
      orderId: true,
    },
  });

  const totalSales = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalOrders = new Set(orderItems.map(item => item.orderId)).size;

  return {
    totalOrders,
    totalSales,
  };
};

export const getTopSalesProducts = async (storeId: string) => {
  const topItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      product: {
        storeId: storeId,
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  if (topItems.length === 0) return [];

  const productIds = topItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });

  return topItems.map((item) => ({
    totalOrders: item._sum.quantity || 0,
    product: products.find((p) => p.id === item.productId),
  }));
};

export const getPriceRangeStats = async (storeId: string) => {
  const allMyItems = await prisma.orderItem.findMany({
    where: {
      product: { storeId: storeId }
    },
    select: {
      price: true,
      quantity: true,
      orderId: true
    }
  });

  const totalMySales = allMyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
const ranges = [
  { label: "1만원 이하", min: 0, max: 10000 },
  { label: "1만원~3만원", min: 10001, max: 30000 },
  { label: "3만원~5만원", min: 30001, max: 50000 },
  { label: "5만원~10만원", min: 50001, max: 100000 },
  { label: "10만원 이상", min: 100001, max: 2147483647 }, 
];

  return ranges.map((r) => {
    const itemsInRange =  allMyItems.filter(item => {
      return item.price >= r.min && item.price <= r.max;
    });

    const rangeTotalSales = itemsInRange.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      priceRange: r.label,
      totalSales: rangeTotalSales,
      percentage: totalMySales > 0
        ? Number(((rangeTotalSales / totalMySales) * 100).toFixed(1))
        : 0,
    };
  });
};