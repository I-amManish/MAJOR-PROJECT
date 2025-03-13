const multer = require("multer");
const path = require("path");

// info: Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads"); // info: Destination folder for storing uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // info: Unique filename
    },
});

// info: File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// info: Initialize multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
