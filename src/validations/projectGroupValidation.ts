import Joi from "joi";

export const createProjectGroupSchema = Joi.object({
    name: Joi.string().required().min(2).max(100),
    members: Joi.array().items(Joi.string().hex().length(24)).required(),
    project: Joi.string().hex().length(24),
    guide: Joi.string().hex().length(24),
    coordinator: Joi.string().hex().length(24).required(),
    created_by:Joi.string().hex().length(24).required()
});

export const updateProjectGroupSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    members: Joi.array().items(Joi.string().hex().length(24)),
    project: Joi.string().hex().length(24),
    guide: Joi.string().hex().length(24),
    coordinator: Joi.string().hex().length(24),
    created_by:Joi.string().hex().length(24).required()
}); 