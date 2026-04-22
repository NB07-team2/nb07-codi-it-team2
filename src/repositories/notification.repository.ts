import { NotificationType } from "@prisma/client";
import prisma from "../utils/prismaClient.util"

export const getBuyerNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: {
            userId: userId,
            isChecked: false,
            type: { in: ["SOLDOUT", "INQUIRY_ANSWER"]}
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
            isChecked: false,
            type: { in: ["SOLDOUT","NEW_INQUIRY"]}
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

export const markAsRead = async (ids: string[]) => {
    return await prisma.notification.updateMany({
        where: {
            id: { in: ids },
        },
        data: {
            isChecked: true,
        },
    });
};