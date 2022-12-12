import Validator from '@app/helpers/validator.helper';
import { Router } from 'express';
import { TaskController } from './task.controller';
import { validateIdTask, validateListTasks, vlaidateCreateTask, vlaidateUpdateTask } from './task.validate';

class TaskRoute {
    router = Router();
    taskController: TaskController = new TaskController();
    validator: Validator = new Validator();

    constructor() {
        this.init();
    }

    init() {
        this.router.get('/', this.validator.validateQuery(validateListTasks), this.taskController.listTasks);
        this.router.post('/', this.validator.validateBody(vlaidateCreateTask), this.taskController.createTask);
        this.router.put('/:id', this.validator.validateParams(validateIdTask), this.validator.validateBody(vlaidateUpdateTask), this.taskController.editTask);
        this.router.delete('/:id', this.validator.validateParams(validateIdTask), this.taskController.deleteTask);
    }
}

export const taskRoute = new TaskRoute().router;