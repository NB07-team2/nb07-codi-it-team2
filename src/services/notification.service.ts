import { SimpleUser } from "../types/cart.type";
import * as notificationRepository from "../repositories/notification.repository";
import { Notification as PrismaNotification } from "@prisma/client";

type NotificationResponse = Omit<PrismaNotification, "type" | "isSent">;

export const getNotificationsStream = async(user: SimpleUser): Promise<NotificationResponse[]> => {
    let notifications: NotificationResponse[] = [];

    if (user.type === "BUYER") {
        notifications = await notificationRepository.getBuyerNotifications(user.id);
    } else if (user.type === "SELLER") {
        notifications = await notificationRepository.getSellerNotifications(user.id);
    }

    return notifications;
};

export const markAsSent = async (ids: string[]) => {
    await notificationRepository.markAsSent(ids);
}