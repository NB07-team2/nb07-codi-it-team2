import prisma from '../utils/prismaClient.util';

export async function getUserPoints(userId: string) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            points: true,
        },
    });
    return user ? user.points : 0;
}