import multer from 'multer';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter,
});

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message.startsWith('Only image')) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
};

export default upload;
