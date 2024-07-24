const express = require('express')
const router = express()
const {permissionAddValidator, permissionDeleteValidator, permissionUpdateValidator} = require('../helper/adminValidator')
const {addPermission, updatePermissionById, allPermission, deletePermission} = require('../controllers/admin/permissionController')
const {authMiddleware, isAdmin} = require('../middlewares/authMiddleWare')
router.post('/add-permission', authMiddleware ,isAdmin, permissionAddValidator,addPermission)
router.patch('/edit-permission', authMiddleware ,isAdmin, permissionUpdateValidator,updatePermissionById)
router.get('/all-permission', authMiddleware ,isAdmin,allPermission)
router.delete('/delete-permission', authMiddleware ,isAdmin, permissionDeleteValidator,deletePermission)

module.exports = router