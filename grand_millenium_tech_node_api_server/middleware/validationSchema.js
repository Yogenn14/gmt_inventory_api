const Joi = require('joi');

const validateSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    inventoryId: Joi.number().integer().required(),
    type: Joi.string().valid('serialized', 'non-serialized').required(),
    serialNumber: Joi.string().when('type', { is: 'serialized', then: Joi.required() }),
    quantityChange: Joi.number().integer().positive().required(),
    date: Joi.date().when('type', { is: 'non-serialized', then: Joi.required() }),
    supplier: Joi.string().required(),
    manufactureroem: Joi.string().required(),
    condition: Joi.string().valid('Used', 'Refurbished', 'New').required(),
    status: Joi.string().required(),
    userEmail: Joi.string().email().required(),
    inDate: Joi.date().when('type', { is: 'serialized', then: Joi.required() }),
    outDate: Joi.date().allow(null, ''),
    customer: Joi.string().allow(''),
    unitPrice: Joi.number().positive().required(),
    totalPrice: Joi.number().positive().required(),

    warrantyEndDate: Joi.date().when('type', { is: 'serialized', then: Joi.required() })
      .greater(Joi.ref('inDate')).allow(null)
  })).required()
});

module.exports = { validateSchema };
