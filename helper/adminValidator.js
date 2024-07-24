const { body } = require('express-validator');
const mongoose = require('mongoose');

exports.permissionAddValidator = [
    body('permission_name').notEmpty().withMessage('permission_name is required')
];
exports.permissionDeleteValidator = [
    body('id').notEmpty().withMessage('id is required is required')
];
exports.permissionUpdateValidator = [
    body('permission_name').notEmpty().withMessage('permission_name is required is required'),
    body('id').notEmpty().withMessage('id is required is required')
];

exports.categoryAddValidator = [
    body('category_name')
        .notEmpty()
        .withMessage('category_name is required'),
    body('subCategories')
        .isArray({ min: 1 })
        .withMessage('subCategories must be an array with at least one sub-category id')
        .custom((subCategories) => {
            if (subCategories.some(id => !mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('All subCategories must be valid MongoDB ObjectIds');
            }
            return true;
        })
];

exports.categoryUpdateValidator = [
    body('id').notEmpty().withMessage('id is required'),
    body('category_name').notEmpty().withMessage('category_name is required is required'),
    body('subCategories')
    .isArray({min: 1})
    .withMessage('subCategories must be an array with at least one sub-category id')
    .custom((subCategories) => {
        if(subCategories.some(id => !mongoose.Types.ObjectId.isValid(id))){
            throw new Error('All subcategories must be valid MongoDB ObjectIds')
        }
        return true
    })
];


exports.subCategoryAddValidator = [
    body('subcategory_name').notEmpty().withMessage('subcategory_name is required')
]
exports.subCategoryUpdateValidator = [
    body('subcategory_name').notEmpty().withMessage('subcategory_name is required'),
    body('id').notEmpty().withMessage('id is required ')
]