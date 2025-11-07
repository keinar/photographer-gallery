const express = require('express');
const router = express.Router();
const {
  createGallery,
  uploadImagesToGallery,
} = require('../controllers/galleryController.js');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.route('/').post(protect, createGallery);

router
  .route('/:id/upload')
  .post(protect, upload.array('images', 10), uploadImagesToGallery);
  
module.exports = router;