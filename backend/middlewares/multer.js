import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not supported. Allowed: PDF, DOCX, PNG, JPG'), false);
        }
    }
}).single("file");