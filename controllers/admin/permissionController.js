const {validationResult} = require('express-validator')
const PermissionSchema = require('../../models/perminssionModel')

const addPermission = async (req, res) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({success: false, msg: "Errors", errors: errors.array()})
        }

        const {permission_name} = req.body;
      const isExist = await PermissionSchema.findOne({permission_name})
      if(isExist){
        return res.status(400).json({success: false, msg: "Permission name already exists"})
      }

      var obj = {
        permission_name
      }

      if(req.body.default){
        obj.is_default = parseInt(req.body.default)
      }

      const permission = new PermissionSchema(obj)
      const newPermission = await permission.save()
     res.status(201).json({result: newPermission, msg: "permission added successfully", success: true})
     console.log("error",newPermission);

    } catch (error) {
        return res.status(400).json({success: false, msg: error.message})
    }
}

const updatePermissionById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, msg: "Errors", errors: errors.array() });
        }

        const { id, permission_name } = req.body;
        console.log("request", id);

        const isExist = await PermissionSchema.findOne({_id: id})
        if(!isExist){
            return res.status(400).json({success: false, message: "permmision not found"})
        }

        const isNotUpdateValue = await PermissionSchema.findOne({_id: id, permission_name})

        if(isNotUpdateValue){
            return res.status(400).json({success: false, message: "please update the value"})
        }

        const isNameAssign = await PermissionSchema.findOne({
            _id: {$ne: id},
            permission_name
        })

        if(isNameAssign){
            return res.status(400).json({success: false, message: "permmision name is already assign"})
        }

        const updateObj = {
            permission_name
        }

        if(req.body.default){
            updateObj.is_default = parseInt(req.body.default)
        }

        const updatePerm = await PermissionSchema.findByIdAndUpdate({_id: id}, {$set: updateObj},
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, msg: "Permission updated successfully", result: updatePerm });
    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
};

const allPermission = async (req, res) => {
    try {
        const allPerm = await PermissionSchema.find()
        if(!allPerm){
            res.status(400).json({success: false, msg: "not Found"})
        }
        res.status(200).json({success: true, result: allPerm, msg: "all permission fetched"})
    } catch (error) {
        return res.status(400).json({success: false, msg: error.message})
        
    }
}

const deletePermission = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }
        
        const { id } = req.body;
        const deleteParam = await PermissionSchema.findByIdAndDelete({ _id: id });

        if (deleteParam.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }

        return res.status(200).json({ success: true, message: "Permission deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addPermission, 
    updatePermissionById,
    allPermission,
    deletePermission
}