const express = require('express');
const router = express.Router();
const {
  createGallery,
  uploadImagesToGallery,
  getGalleriesForUser,
  getGalleryBySecretLink,
  deleteGalleryById,
  deleteImageFromGallery,
  downloadGalleryAsZip
} = require('../controllers/galleryController.js');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createGallerySchema } = require('../validation/gallerySchemas');

router.route('/')
  .get(protect, getGalleriesForUser)
  .post(validate(createGallerySchema), protect, createGallery);

router.route('/public/:secretLink')
  .get(getGalleryBySecretLink);

router.route('/public/:secretLink/download')
  .get(downloadGalleryAsZip);

router.route('/:id')
  .delete(protect, deleteGalleryById);

router
  .route('/:id/upload')
  .post(protect, upload.array('images', 10), uploadImagesToGallery);

router.route('/:galleryId/image')
  .delete(protect, deleteImageFromGallery);

module.exports = router;