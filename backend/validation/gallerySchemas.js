const { z } = require('zod');

const createGallerySchema = z.object({
    body: z.object({
        title: z.object({
            required_error: 'Gallery title is required',
        }).min(3, { message: 'Gallery title must be at least 3 characters long' }),

        clientName: z.string().optional(),
        }),
});

module.exports = {
    createGallerySchema,
};