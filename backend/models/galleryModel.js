const mongoose = require('mongoose');
const nanoid = require('nanoid');

const imageSchema = mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
            public_id: {
            type: String,
            required: true,
        },
        fileName: {
            type: String,
        }
    });
    
const gallerySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Please add a gallery title'],
        },
        clientName: {
            type: String,
        },
        secretLink: {
            type: String,
            required: true,
            unique: true,
            default: () => nanoid.nanoid(10),
        },
        images: [imageSchema],
    },
    {
        timestamps: true,
    }
);
        
const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;