
const cloudinaryApi = require("cloudinary");
const cloudinary = cloudinaryApi.v2;
const cloudinaryStorage = require("multer-storage-cloudinary");
const ExpressError = require("./utils/ExpressError.js");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const cloudinaryEngine = cloudinaryStorage({
    cloudinary: cloudinaryApi,
    folder: "wanderlust_DEV",
    allowedFormats: ["png", "jpg", "jpeg"]
});

const requiredCloudinaryEnv = [
    "CLOUD_NAME",
    "CLOUD_API_KEY",
    "CLOUD_API_SECRET"
];

const storage = {
    _handleFile(req, file, callback) {
        const missing = requiredCloudinaryEnv.filter(
            (name) => !process.env[name]
        );

        if (missing.length > 0) {
            return callback(
                new ExpressError(
                    503,
                    `Image uploads are unavailable. Set ${missing.join(", ")} in your .env file.`
                )
            );
        }

        cloudinaryEngine._handleFile(req, file, callback);
    },

    _removeFile(req, file, callback) {
        cloudinaryEngine._removeFile(req, file, callback);
    }
};

module.exports = {
    cloudinary,
    storage
};
