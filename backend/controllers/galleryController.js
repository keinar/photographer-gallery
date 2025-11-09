const asyncHandler = require('express-async-handler');
const Gallery = require('../models/galleryModel');
const cloudinary = require('../config/cloudinary');
const JSZip = require('jszip');
const axios = require('axios');

// @desc Create new gallery item
// @route POST /api/gallery
// @access Private
const createGallery = asyncHandler(async (req, res) => {
    const { title, clientName } = req.body;
    if (!title) {
        res.status(400);
        throw new Error('Title is required');
    }
    const gallery = await Gallery.create({
        title,
        clientName,
        user: req.user._id,
    });
    res.status(201).json(gallery);
});

// @desc Upload image to gallery
// @route POST /api/gallery/:id/upload
// @access Private
const uploadImagesToGallery = asyncHandler(async (req, res) => {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
        res.status(404);
        throw new Error('Gallery not found');
    }

    if (gallery.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to upload images to this gallery');
    }

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No files were uploaded');
    }
    const uploadedImages = [];

    for (const file of req.files) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: `photographer_gallery/${gallery._id}`,
            });

            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
                fileName: file.originalname,
            });
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
        }
    }
    
    gallery.images.push(...uploadedImages);
    await gallery.save();

    res.status(200).json({
        message: `Uploaded ${uploadedImages.length} images successfully`,
        gallery,
    });
});

// desc Get gallery by secret link
// route GET /api/gallery/link/:secretLink
// access Public
const getGalleryBySecretLink = asyncHandler(async (req, res) => {
    const gallery = await Gallery.findOne({ secretLink: req.params.secretLink });

    if (!gallery) {
        res.status(404);
        throw new Error('Gallery not found or invalid link  ');
    }

    res.status(200).json(gallery);
});

// desc Delete gallery by ID
// route DELETE /api/gallery/:id
// access Private
const deleteGalleryById = asyncHandler(async (req, res) => {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
        res.status(404);
        throw new Error('Gallery not found');
    }

    if (gallery.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this gallery');
    }

    if (gallery.images.length > 0) {
        const folderPath = `photographer_gallery/${gallery._id}`;

        try {
            console.log(`Attempting to delete Cloudinary folder: ${folderPath}`);
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            await cloudinary.api.delete_folder(folderPath);
            console.log(`Cloudinary folder ${folderPath} deleted.`);
        } catch (error) {
            console.error('Error deleting images from Cloudinary:', error);
        }
    }

        await Gallery.findByIdAndDelete(req.params.id);

        res.status(200).json({ 
            message: 'Gallery and associated images deleted successfully',
            id: req.params.id
        });
});

// @desc    Delete an image from a gallery
// @route   DELETE /api/galleries/:galleryId/image
// @access  Private
const deleteImageFromGallery = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  const { galleryId } = req.params;

  if (!publicId) {
    res.status(400);
    throw new Error('Image Public ID is required');
  }

  const gallery = await Gallery.findById(galleryId);

  if (!gallery) {
    res.status(404);
    throw new Error('Gallery not found');
  }

  if (gallery.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  try {
    console.log(`Attempting to delete image ${publicId} from Cloudinary...`);
    await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary.');
  } catch (error) {
    console.error('Cloudinary image deletion failed:', error);
  }

  await Gallery.updateOne(
    { _id: galleryId },
    { $pull: { images: { public_id: publicId } } }
  );

  res.status(200).json({ 
    message: 'Image deleted successfully',
    publicId: publicId
  });
});

// @desc    Download gallery as a ZIP file
// @route   GET /api/galleries/public/:secretLink/download
// @access  Public
const downloadGalleryAsZip = asyncHandler(async (req, res) => {
  const gallery = await Gallery.findOne({ secretLink: req.params.secretLink });

  if (!gallery || gallery.images.length === 0) {
    res.status(404);
    throw new Error('Gallery not found or has no images.');
  }

  const zip = new JSZip();

  await Promise.all(
    gallery.images.map(async (image) => {
      try {
        const response = await axios.get(image.url, {
          responseType: 'arraybuffer',
        });

        zip.file(image.fileName, response.data);
      } catch (err) {
        console.error(`Failed to fetch image ${image.url}:`, err.message);
        zip.file(`FAILED_${image.fileName}.txt`, `Could not download image: ${image.url}`);
      }
    })
  );

  const fileName = `${gallery.title.replace(/ /g, '-') || 'gallery'}.zip`;

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="${fileName}"`,
  });

  zip
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(res)
    .on('finish', () => console.log('ZIP file sent successfully.'));
});

// desc Get galleries for user
// route GET /api/gallery
// access Private
const getGalleriesForUser = asyncHandler(async (req, res) => {
    const galleries = await Gallery.find({ user: req.user._id });
    res.status(200).json(galleries);
}
);

module.exports = {
  createGallery,
  uploadImagesToGallery,
  getGalleriesForUser,
  getGalleryBySecretLink,
  deleteGalleryById,
  deleteImageFromGallery,
  downloadGalleryAsZip
};