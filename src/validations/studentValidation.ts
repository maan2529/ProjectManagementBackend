import Joi from "joi";

export const createStudentSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    prn: Joi.string().required(),
    Roll_no: Joi.string().required(),
    groups: Joi.array().items(Joi.string().hex().length(24)),
    projects: Joi.array().items(Joi.string().hex().length(24))
});

export const updateStudentSchema = Joi.object({
    prn: Joi.string(),
    seatNumber: Joi.string(),
    groups: Joi.array().items(Joi.string().hex().length(24)),
    projects: Joi.array().items(Joi.string().hex().length(24))
}); 