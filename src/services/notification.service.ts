import { SimpleUser } from "../types/cart.type";
import * as notificationRepository from "../repositories/notification.repository";
import { NotificationType, Notification as PrismaNotification } from "@prisma/client";
import { GetNotificationsInput } from "../structs/notification.struct";
import { ForbiddenError, NotFoundError } from "../errors/errors";

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

export const getNotifications = async(user: SimpleUser, query:GetNotificationsInput) => {
    const { page, pageSize, sort, filter } = query;
    const skip = (page - 1) * pageSize;

    const notificationType = user.type === "BUYER"
    ? [NotificationType.SOLDOUT, NotificationType.INQUIRY_ANSWER]
    : [NotificationType.SOLDOUT, NotificationType.NEW_INQUIRY];

    let isCheckedField: boolean | undefined;
    if (filter === "unChecked") isCheckedField = false;
    if (filter === "checked") isCheckedField = true;

    const { list, totalCount } = await notificationRepository.findAllNotifications({
        userId: user.id,
        types: notificationType,
        isChecked: isCheckedField,
        skip,
        take: pageSize,
        sort,
    });

    return { list, totalCount};
};

export const markAsRead = async(userId:string, alarmId:string) => {
    const notification = await notificationRepository.getNotificationById(alarmId);

    if (!notification) {
        throw new NotFoundError("요청한 리소스를 찾을 수 없습니다.");
    }

    if (notification.userId !== userId) {
        throw new ForbiddenError("접근 권한이 없습니다.");
    }

    return await notificationRepository.updateNotificationReadStatus(alarmId, true);
};