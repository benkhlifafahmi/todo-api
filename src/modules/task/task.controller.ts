import { NextFunction, Request, Response } from 'express';
import { TaskService } from './task.service';

export class TaskController {
    taskService: TaskService = new TaskService();
    
    constructor() {
        this.listTasks = this.listTasks.bind(this);
        this.createTask = this.createTask.bind(this);
        this.editTask = this.editTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
    }

    // controller function to list task for the authenticated user.
    async listTasks(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { completed } = req.query;
            const userId: number = req.user?.id;
            const data = await this.taskService.getUserTasks(userId, completed as boolean | undefined);
            return res.status(200)
                .json({
                    success: true,
                    data,
                });
        } catch (err) {
            next(err);
        }
    }

    // controller function to create a new task for the current user.
    async createTask(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { title } = req.body;
            const userId: number = req.user?.id;
            const task = await this.taskService.createTask(
                userId,
                title,
            );
            return res.status(201)
                .json({
                    success: true,
                    task,
                });
        } catch (err) {
            next(err);
        }
    }

    // controller function to update task title or completed status.
    async editTask(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { title, completed } = req.body;
            const { id } = req.params;
            const userId: number = req.user?.id;
            const taskToEdit = await this.taskService.getTask(parseInt(id, 10));
            if (!taskToEdit) {
                return res.status(404)
                .json({
                    success: false,
                    message: 'No task with the provided id.'
                });
            }
            if (taskToEdit.userId !== userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access to update the requested task.',
                });
            }
            const task = await this.taskService.editTask(
                taskToEdit.id,
                title,
                completed,
            );
            return res.status(200)
                .json({
                    success: true,
                    task,
                });
        } catch (err) {
            next(err);
        }
    }

    // controller function to delete a specific task.
    async deleteTask(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const { id } = req.params;
            const userId: number = req.user?.id;
            const taskToDelete = await this.taskService.getTask(parseInt(id, 10));
            if (!taskToDelete) {
                return res.status(404)
                .json({
                    success: false,
                    message: 'No task with the provided id.'
                });
            }
            if (taskToDelete.userId !== userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized access to delete the requested task.',
                });
            }
            const task = await this.taskService.deleteTask(taskToDelete.id);
            return res.status(200)
                .json({
                    success: true,
                    task,
                });
        } catch (err) {
            next(err);
        }
    }
}