// const express = require("express")

// const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
// const multer = require("multer")
// const multerS3 = require("multer-s3")

// const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//     },
// });


// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.BUCKET_NAME,
//         metadata: function(req, file, cb) {
//             cb(null, {fileName: file.originalname});
//         },
//         key: function (req, file, cb) {
//             cb(null, file.originalname)
//         }
//     })
// })


// module.exports = upload;
