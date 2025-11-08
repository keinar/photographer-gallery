const express = require('express');
const router = express.Router();
const {
  createGallery,
  uploadImagesToGallery,
  getGalleriesForUser,
  getGalleryBySecretLink,
} = require('../controllers/galleryController.js');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.route('/')
  .get(protect, getGalleriesForUser)
  .post(protect, createGallery);

router
  .route('/:id/upload')
  .post(protect, upload.array('images', 10), uploadImagesToGallery);

router.route('/public/:secretLink')
  .get(getGalleryBySecretLink);

module.exports = router;