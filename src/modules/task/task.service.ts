import prisma from '@app/../prisma/db';

export class TaskService {
    /**
     * Get specific task based on the task Id.
     * @author Ben
     * @param id the task id we want to locate.
     * @returns undefined|null if there was no task with that id or the task object (id, title, completed, userId, createdAt, updatedAt).
     */
    async getTask(id: number) {
        return prisma.task.findFirst({
            where: { id },
            select: {
                id: true,
                title: true,
                userId: true,
                completed: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Get user tasks list (all or filter by status -completed or uncompleted tasks-).
     * @author Ben
     * @param userId the user id we want to get his list. (list of tasks owned by USER<userId>).
     * @param completed the status of tasks (if provided true is completed, false is non completed tasks, undefined|null: all tasks).
     * @returns empty array if there is no tasks, or an array of task objects (id, title, completed, createdAt).
     */
    async getUserTasks(userId: number, completed?: boolean) {
        const where: { [key: string]: any } = {
            userId,
        };
        if (completed !== undefined && completed !== null) {
            where.completed = completed;
        }
        return prisma.task.findMany({
            where,
        });
    }

    /**
     * Create a task and link it to specific user.
     * @author Ben
     * @param userId the owner id of the new task.
     * @param title the title of the new task.
     * @returns Task Object if it was created (id, title, completed, createdAt).
     */
    async createTask(userId: number, title: string) {
        return prisma.task.create({
            data: {
                user: { connect: { id: userId } },
                title,
            },
            select: {
                id: true,
                title: true,
                completed: true,
                createdAt: true,
            },
        });
    }

    /**
     * partially update task value (title or completed status).
     * @author Ben
     * @param id of the task we want to update.
     * @param title if set to a specific string value, the title of TASK<id> will updated to the @title value.
     * @param completed if set to (true|false) the task TASK<id> status will be set to completed or uncompleted based on the value.
     * @returns Task Object after being updated. (id, title, completed, createdAt, updatedAt).
     */
    async editTask(id: number, title?: string, completed?: boolean) {
        const data: { [key: string]: any } = {};
        if (title !== undefined) {
            data.title = title;
        }
        if (completed !== undefined) {
            data.completed = completed;
        }
        return prisma.task.update({
            where: {
                id,
            },
            data,
            select: {
                id: true,
                title: true,
                completed: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Delete a specific Task.
     * @author Ben
     * @param id of the task we want to delete
     * @returns TASK<id> object that has been deleted (id, title, completed, createdAt, updatedAt).
     */
    async deleteTask(id: number) {
        return prisma.task.delete({
            where: { id },
            select: {
                id: true,
                title: true,
                completed: true,
                createdAt: true,
            }
        })
    }
}