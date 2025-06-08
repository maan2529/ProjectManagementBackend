import Joi from "joi";

export const createCoordinatorSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    managedProjects: Joi.array().items(Joi.string().hex().length(24)),
    maxGroupSize: Joi.number().integer().min(1).max(10).required()
});

export const updateCoordinatorSchema = Joi.object({
    managedProjects: Joi.array().items(Joi.string().hex().length(24)),
    maxGroupSize: Joi.number().integer().min(1).max(10)
}); 