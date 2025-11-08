const asyncHandler = require('express-async-handler');
const Gallery = require('../models/galleryModel');
const cloudinary = require('../config/cloudinary');

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
};