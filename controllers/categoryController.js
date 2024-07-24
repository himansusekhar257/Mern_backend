const { validationResult } = require('express-validator');
const subCategoryModel = require('../models/subCategoryModel');
const categoryModel = require('../models/categoryModel');
const { mongo, default: mongoose } = require('mongoose');

const addSubCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: "Errors", errors: errors.array() });
        }

        const { subcategory_name } = req.body;
        const isSubCatExist = await subCategoryModel.findOne({ subcategory_name });
        if (isSubCatExist) {
            return res.status(400).json({ success: false, message: "Sub-category already exists" });
        }

        // Create new sub-category
        const newSubCategory = new subCategoryModel({
            subcategory_name
        });

        await newSubCategory.save();
        return res.status(201).json({ success: true, message: "Sub-category created successfully", subCategory: newSubCategory });
    } catch (error) {
        // Handle errors
        return res.status(500).json({ success: false, message: error.message });
    }
};

const editSubCategory = async (req,res)=> {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: "Errors", errors: errors.array() });
        }

        const {id, subcategory_name} = req.body
        const isSubCatExist = await subCategoryModel.findOne({
            _id: {$ne: id},
            subcategory_name
        })
        if (isSubCatExist) {
            return res.status(400).json({ success: false, message: "Sub-category name already exists" });
        }

        const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(
            id,
            {subcategory_name},
            {new: true, runValidators: true}
        )

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found" });
        }
        return res.status(200).json({ success: true, message: "Sub-category updated successfully", result: updatedSubCategory });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

const getAllSubCategory = async (req, res) => {
    try {
        const allSubCategory = await subCategoryModel.find()
        res.status(200).json({ allSubCategory: allSubCategory })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
        
    }
}

// Create Category
const addCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: "Errors", errors: errors.array() });
        }

        const { category_name, subCategories } = req.body;

        // Check if the Category exists
        const existingCategory = await categoryModel.findOne({ category_name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }

        // Check if the subCategories exist
        const existingSubCategories = await subCategoryModel.find({
            '_id': { $in: subCategories.map(id => new mongoose.Types.ObjectId(id)) }
        });

        if (existingSubCategories.length !== subCategories.length) {
            return res.status(400).json({ success: false, message: "One or more sub-categories do not exist" });
        }

        // Check for duplicate sub-categories within the same category
        const duplicateCheck = await categoryModel.aggregate([
            { $match: { category_name } },
            { $unwind: "$subCategories" },
            { $match: { "subCategories": { $in: subCategories.map(id => new mongoose.Types.ObjectId(id)) } } },
            { $group: { _id: "$_id", duplicateSubCategories: { $push: "$subCategories" } } }
        ]);

        if (duplicateCheck.length > 0) {
            return res.status(400).json({ success: false, message: "Sub-category already exists in this category", duplicateSubCategories: duplicateCheck[0].duplicateSubCategories });
        }

        const newCategory = new categoryModel({
            category_name,
            subCategories
        });

        await newCategory.save();

        // Send success response
        return res.status(201).json({ success: true, message: "Category created successfully", category: newCategory });

    } catch (error) {
        // Handle errors
        return res.status(500).json({ success: false, message: error.message });
    }
};


const updateCategory = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: "Errors", errors: errors.array() });
        }

        const {id, category_name, subCategories} = req.body;

        const existCategory = await categoryModel.findById(id);
        if (!existCategory) {
            return res.status(400).json({ success: false, message: "Category to be updated does not exist" });
        }

        // Check if the new category name already exists
        const categoryWithName = await categoryModel.findOne({ category_name });
        if (categoryWithName && categoryWithName._id.toString() !== id) {
            return res.status(400).json({ success: false, message: "Category name already exists" });
        }

        // const existingSubCategories = await subCategoryModel.find({
        //     '_id': {$in: subCategories.map(subCat => new mongoose.Types.ObjectId(subCat))}
        // });

        // if (existingSubCategories.length !== subCategories.length) {
        //     return res.status(400).json({ success: false, message: "One or more sub-categories do not exist" });
        // }

       existCategory.category_name = category_name;
       existCategory.subCategories = subCategories;

      await existCategory.save()

      res.status(200).json({success: true, message: "Category updated successfully", category: existCategory})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });        
    }
}


const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().populate('subCategories');
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addSubCategory,
    editSubCategory,
    getAllSubCategory,
    addCategory,
    getAllCategories,
    updateCategory
};
