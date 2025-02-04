const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'properties');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

function fileFilter (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});




const sharp = require('sharp');



async function compressImage(filePath, maxWidth = 1200, quality = 80) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const tempPath = path.join(dir, `${base}-temp${ext}`);

  await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true }) 
    .jpeg({ quality }) 
    .toFile(tempPath);

  fs.unlinkSync(filePath);

  fs.renameSync(tempPath, filePath);
}

module.exports = {
  compressImage, upload
};
