import Joi from 'joi';

// JOi validate the create new task request.
export const vlaidateCreateTask = Joi.object({
    title: Joi.string().trim().min(4).required(),
});

// Joi validate the update task status or title.
export const vlaidateUpdateTask = Joi.object({
    title: Joi.string().trim().min(4),
    completed: Joi.boolean(),
}).or('title', 'completed');

// JOi validate the list tasks.
export const validateListTasks = Joi.object({
    completed: Joi.boolean().allow(null),
});

// JOi validate the task id for parameters.
export const validateIdTask = Joi.object({
    id: Joi.number().required(),
});