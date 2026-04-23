import { z } from 'zod'

export const getNotificationsSchema = z.object({
    page: z.preprocess((val) => Number(val) || 1, z.number().min(1).default(1)),
    pageSize: z.preprocess((val) => Number(val) || 10, z.number().min(1).default(10)),
    sort: z.enum(['recent', 'oldest']).default('recent'),
    filter: z.enum(['all', 'unChecked', 'checked']).default('all'),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;