const express = require('express')
const router = express()

const {authMiddleware} = require('../middlewares/authMiddleWare')
const {categoryAddValidator, categoryUpdateValidator, subCategoryAddValidator, subCategoryUpdateValidator} = require('../helper/adminValidator')
const { addSubCategory, editSubCategory, getAllSubCategory, addCategory, getAllCategories, updateCategory } = require('../controllers/categoryController')

router.post('/add-category', authMiddleware, categoryAddValidator, addCategory )
router.patch('/edit-category',authMiddleware, categoryUpdateValidator, updateCategory )
router.get('/all-category', authMiddleware, getAllCategories)
// router.delete('/delete-category', )

router.post('/add-subcategory', authMiddleware, subCategoryAddValidator, addSubCategory )
router.patch('/edit-subcategory', authMiddleware, subCategoryUpdateValidator, editSubCategory)
router.get('/all-subcategory', authMiddleware, getAllSubCategory )
// router.delete('/delete-subcategory', )

module.exports = router