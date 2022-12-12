/* eslint-disable import/no-mutable-exports */
import { Prisma, PrismaClient } from '@prisma/client';
import { env } from 'process';

const prisma: PrismaClient<Prisma.PrismaClientOptions, 'query'> = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
        db: {
            url: env.NODE_ENV === 'test' ? env.TEST_DATABASE_URL : env.DATABASE_URL,
        },
    },
});

export default prisma;
