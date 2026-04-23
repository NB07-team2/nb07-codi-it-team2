import { NotificationType } from "@prisma/client";
import prisma from "../utils/prismaClient.util"

export const getBuyerNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: {
            userId: userId,
            isSent: false,
            type: {
                in: [NotificationType.SOLDOUT, NotificationType.INQUIRY_ANSWER]
            }
        },
        select: {
            id: true,
            userId: true,
            content: true,
            isChecked: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc"}
    });
};

export const getSellerNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: {
            userId: userId,
            isSent: false,
            type: {
                in: [NotificationType.SOLDOUT, NotificationType.NEW_INQUIRY]
            }
        },
        select: {
            id: true,
            userId: true,
            content: true,
            isChecked: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: { createdAt: "desc" }
    });
};

export const createNotification = async (data: { userId: string, content: string, type: NotificationType }) => {
    return await prisma.notification.create({
        data: {
            userId: data.userId,
            content: data.content,
            type: data.type,
            isChecked: false
        }
    });
};

export const markAsSent = async (ids: string[]) => {
    return await prisma.notification.updateMany({
        where: {
            id: { in: ids },
        },
        data: {
            isSent: true
        },
    });
};

export const findAllNotifications = async (params: {
    userId: string,
    types: string[];
    isChecked?: boolean;
    skip: number;
    take: number;
    sort: 'recent' | 'oldest';
}) => {
    const { userId, types, isChecked, skip, take, sort } = params;

    const where = {
        userId,
        type: { in: types as NotificationType[] },
        ...(isChecked !== undefined && { isChecked }),
    };

    const [list, totalCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: sort === 'recent' ? 'desc' : 'asc' },
        }),
        prisma.notification.count({ where }),
    ]);
    return { list, totalCount };
}