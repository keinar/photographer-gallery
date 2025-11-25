const asyncHandler = require('express-async-handler');
const Gallery = require('../models/galleryModel');
const cloudinary = require('../config/cloudinary');
const archiver = require('archiver'); 
const axios = require('axios');

// @desc Create new gallery item
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
    
    // Concurrent uploads to Cloudinary
    const uploadPromises = req.files.map(file => {
        const isVideo = file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'auto';

        return cloudinary.uploader.upload(file.path, {
            folder: `photographer_gallery/${gallery._id}`,
            resource_type: resourceType,
        })
        .then(result => ({
            url: result.secure_url,
            public_id: result.public_id,
            fileName: file.originalname,
            resourceType: result.resource_type,
        }))
        .catch(error => {
            console.error(`Error uploading ${file.originalname} to Cloudinary:`, error);
            return null; 
        });
    });

    const uploadedImages = (await Promise.all(uploadPromises)).filter(result => result !== null);
    
    gallery.images.push(...uploadedImages);
    await gallery.save();

    res.status(200).json({
        message: `Uploaded ${uploadedImages.length} images successfully`,
        gallery,
    });
});

// desc Get gallery by secret link
const getGalleryBySecretLink = asyncHandler(async (req, res) => {
    const gallery = await Gallery.findOne({ secretLink: req.params.secretLink });

    if (!gallery) {
        res.status(404);
        throw new Error('Gallery not found or invalid link');
    }

    res.status(200).json(gallery);
});

// desc Delete gallery by ID
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
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            await cloudinary.api.delete_folder(folderPath);
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
    await cloudinary.uploader.destroy(publicId);
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

// @desc    Download gallery as a ZIP file (HEBREW SUPPORT FIX)
const downloadGalleryAsZip = asyncHandler(async (req, res) => {
  req.setTimeout(0); // Disable timeout for large downloads

  const gallery = await Gallery.findOne({ secretLink: req.params.secretLink });

  if (!gallery || gallery.images.length === 0) {
    res.status(404);
    throw new Error('Gallery not found or has no images.');
  }

  // ✅ תיקון שמות בעברית:
  // 1. מנקים תווים שאסורים במערכות קבצים (כמו / \ : * ? " < > |) אך משאירים עברית
  const safeTitle = gallery.title.replace(/[\/\\:*?"<>|]/g, '_');
  const filename = `${safeTitle}.zip`;
  
  // 2. מקודדים את השם ל-URL (עבור דפדפנים)
  const encodedFilename = encodeURIComponent(filename);

  // 3. שימוש ב-filename* לתמיכה ב-UTF-8 (עברית) בדפדפנים מודרניים
  res.setHeader('Content-Disposition', `attachment; filename="gallery.zip"; filename*=UTF-8''${encodedFilename}`);
  res.setHeader('Content-Type', 'application/zip');

  const archive = archiver('zip', {
    zlib: { level: 5 }
  });

  archive.pipe(res);

  archive.on('error', (err) => {
    console.error('Archiver Error:', err);
    if (!res.headersSent) {
        res.status(500).send({ error: err.message });
    } else {
        res.end(); 
    }
  });

  // הורדה טורית (אחד אחרי השני) למניעת עומס זיכרון
  for (const image of gallery.images) {
    try {
        const response = await axios({
            url: image.url,
            method: 'GET',
            responseType: 'stream'
        });

        await new Promise((resolve, reject) => {
            archive.append(response.data, { name: image.fileName });
            response.data.on('end', resolve);
            response.data.on('error', (err) => {
                console.error(`Stream error for ${image.fileName}:`, err);
                resolve(); // Continue to next file even if one fails
            });
        });

    } catch (err) {
        console.error(`Failed to fetch image ${image.url}:`, err.message);
        archive.append(Buffer.from(`Error downloading: ${image.url}`), { name: `ERROR_${image.fileName}.txt` });
    }
  }

  await archive.finalize();
});

// desc Get galleries for user
const getGalleriesForUser = asyncHandler(async (req, res) => {
    const galleries = await Gallery.find({ user: req.user._id });
    res.status(200).json(galleries);
});

module.exports = {
  createGallery,
  uploadImagesToGallery,
  getGalleriesForUser,
  getGalleryBySecretLink,
  deleteGalleryById,
  deleteImageFromGallery,
  downloadGalleryAsZip
};