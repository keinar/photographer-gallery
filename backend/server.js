const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const cors = require('cors');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173' // Adjust this domain for production if needed
}));

// -----------------------------------------
// 1. API Routes (Must be defined first)
// -----------------------------------------
app.use('/api/users', userRoutes);
app.use('/api/galleries', galleryRoutes);

// -----------------------------------------
// 2. Serve Static Frontend Files
// -----------------------------------------
// Pointing to 'backend/public' where the built frontend files are located
const frontendPath = path.join(__dirname, 'public');

// Log the path for debugging purposes
console.log('Serving frontend from:', frontendPath);

// Serve static assets (CSS, JS, Images)
app.use(express.static(frontendPath));

// -----------------------------------------
// 3. Catch-All Route (SPA Support)
// -----------------------------------------
// Using app.use() without a path acts as a catch-all for any request not handled above.
// This avoids specific 'path-to-regexp' errors found in some cPanel Node.js environments.
app.use((req, res, next) => {
    // Only handle GET requests that are NOT API requests
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(frontendPath, 'index.html');
        
        // Attempt to send index.html with error handling
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Error sending index.html:', err);
                res.status(500).send(`
                    <h1>Server Error</h1>
                    <p>The server could not find the file: <code>${indexPath}</code></p>
                    <p><strong>Action Required:</strong> Please ensure the Frontend build files (from the <code>dist</code> folder) have been copied into the <code>backend/public</code> folder on your server.</p>
                `);
            }
        });
    } else {
        // Pass non-GET or API requests to the default 404 handler
        next();
    }
});

// Server Configuration
const PORT = process.env.PORT || 5001;
const TIMEOUT = 300000; // 5 minutes timeout for handling large uploads

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Apply the timeout setting to the server instance
server.setTimeout(TIMEOUT);