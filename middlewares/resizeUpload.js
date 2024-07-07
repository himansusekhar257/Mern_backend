const sharp = require('sharp');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const stream = require('stream');
const { promisify } = require('util');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const RESIZED_BUCKET_NAME = process.env.RESIZED_BUCKET_NAME;
const pipeline = promisify(stream.pipeline);

const downloadFileFromS3 = async (bucket, key) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const { Body } = await s3.send(command);
    const chunks = [];
    for await (let chunk of Body) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

const resizeAndUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(); // Skip to next middleware
        }

        // Download the image from S3
        const imageBuffer = await downloadFileFromS3(req.file.bucket, req.file.key);

        // Resize the image using Sharp
        const resizedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 200, height: 200 }) // Adjust resizing options as needed
            .toBuffer();

        // Generate a unique key for the resized image on S3
        const resizedKey = `resized/${Date.now().toString()}-${req.file.originalname}`;

        // Upload the resized image to S3
        const command = new PutObjectCommand({
            Bucket: RESIZED_BUCKET_NAME,
            Key: resizedKey,
            Body: resizedImageBuffer,
            ContentType: 'image/jpeg', // Adjust content type if necessary
        });

        const data = await s3.send(command);
        console.log('Uploaded to S3:', data);

        // Set resizedLocation property on req.file
        req.file.resizedLocation = `https://${RESIZED_BUCKET_NAME}.s3.amazonaws.com/${resizedKey}`;

        next();
    } catch (error) {
        console.error('Error in resizing and uploading:', error);
        next(error);
    }
};

module.exports = resizeAndUpload;
