import Joi from "joi";

export const createGuideSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    maxGroups: Joi.number().integer().min(1).max(10).default(5),
    assignedGroups: Joi.array().items(Joi.string().hex().length(24)),
    expertiseDomains: Joi.array().items(Joi.string().required())
});

export const updateGuideSchema = Joi.object({
    maxGroups: Joi.number().integer().min(1).max(10),
    assignedGroups: Joi.array().items(Joi.string().hex().length(24)),
    expertiseDomains: Joi.array().items(Joi.string())
}); 