
import prisma from '@app/../prisma/db';

export class AuthService {
    /**
     * Create a new User entry in the database.
     * @author Ben
     * @param email user email address
     * @param name user full name
     * @param password user encrypted password
     * @returns object that include the unique id, email, and full name of the created user.
     */
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
    /**
     * Get the user registered with a specific email address.
     * @author Ben
     * @param email user email address we want to locate.
     * @returns user object if the user exist or undefined/null if there are no user registered with the provided email.
     */
    async getUserByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email
            }
        })
    }
}