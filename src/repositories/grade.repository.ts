import { prisma } from '../utils/prismaClient.util';

export const findAllGrades = async () => {
  return await prisma.grade.findMany({
    orderBy: {
      minAmount: 'asc',
    },
  });
};
