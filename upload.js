const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { extname } = require('path');

cloudinary.config({
    cloud_name: 'duvougrqx',
    api_key: '513133278582537',
    api_secret: '0UgeZPnsrmRfbWu-u8eZxo-W0uk',
  });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hackathon_images',
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
    allowed_formats: ['png', 'jpeg', 'jpg'], // Restrict allowed formats
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
