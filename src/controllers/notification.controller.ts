import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.util";
import * as notificationService from "../services/notification.service";

export const streamNotifications = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user!;

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    });

    const send = async () => {
        const notifications = await notificationService.getNotificationsStream(user);
        if(notifications.length > 0) {
            res.write(`data: ${JSON.stringify(notifications)}\n\n`);

            const notificationIds = notifications.map((n) => n.id);
            await notificationService.markAsRead(notificationIds);
        }
    };

    await send();

    const intervalId = setInterval(async () => {
        await send();
    }, 30000);

    req.on("close", () => {
        clearInterval(intervalId);
        res.end();
    })
})