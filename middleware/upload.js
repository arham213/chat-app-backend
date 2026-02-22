const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 1 * 1024 * 1024 // 1 MB limit
    },
    fileFilter(req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            cb (new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
})

module.exports = { upload };