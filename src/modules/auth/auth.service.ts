
import prisma from '@app/../prisma/db';

export class AuthService {
    constructor() {

    }

    async createUser(email: string, name: string, password: string) {
        return prisma.user.create({
            data: {
                email,
                name,
                password,
            },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });
    }

    async getUserByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email
            }
        })
    }
}