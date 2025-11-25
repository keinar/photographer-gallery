# 📸 Photographer's Media Gallery CMS

> A complete Full-Stack MERN application for photographers to securely
> manage and deliver **media galleries (images and videos)**.

## 🚀 Live Demo

https://photo-gallery.keinar.com

------------------------------------------------------------------------

## 🖼️ Project Preview

![alt text](image.png)

------------------------------------------------------------------------

## 📖 About This Project

This project provides a self-hosted, professional platform for
photographers to deliver client galleries with secure access, **cloud
media (images and video) hosting**, and an admin dashboard.

------------------------------------------------------------------------

## ✨ Key Features

-   **Secure Admin Authentication:** Protected routes using JWT and
    bcrypt.js.
-   **Gallery Management:** Create, update, and delete galleries with
    unique secret links.
-   **Cloud Storage:** Automated integration with Cloudinary for
    efficient image and video hosting.
-   **Bulk Uploads:** Drag-and-drop upload with **visual progress bar**.
    Supports concurrent uploads for speed.
-   **Lightbox View:** Full-screen immersive viewing experience for
    images and videos.
-   **Download All:** Generates a ZIP file on-the-fly containing all
    gallery assets.
-   **Responsive Design:** Built with React and Tailwind CSS for mobile
    and desktop.
-   **Production Ready:** Optimized for cPanel/Node.js environments with
    static file serving.

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   **Frontend:** React, React Router, Tailwind CSS, React Toastify,
    Axios, Vite
-   **Backend:** Node.js, Express.js
-   **Database:** MongoDB (Mongoose)
-   **Storage:** Cloudinary
-   **Deployment:** Optimized for cPanel (Node.js Selector)

------------------------------------------------------------------------

## 🚀 Getting Started (Local Development)

### Prerequisites

-   Node.js (v18+ recommended)
-   MongoDB Atlas or local MongoDB
-   Cloudinary account

### 1. Clone the repository

``` bash
git clone https://github.com/keinar/photographer-gallery.git
cd photographer-gallery
```

### 2. Backend Setup

``` bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

``` env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5001
```

Run the backend:

``` bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

``` bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

------------------------------------------------------------------------

## 📦 Deployment Guide (cPanel / Production)

This project is configured to serve the frontend directly from the
backend server.

### Step 1: Build the Frontend

On your local machine, navigate to the frontend folder and build the
React app:

``` bash
cd frontend
npm run build
```

This creates a `dist` folder.

### Step 2: Prepare Server Structure

1.  On your cPanel File Manager, inside your application root, create a
    folder named `public` inside the `backend` directory
    (`backend/public`).
2.  **Copy all contents** from your local `frontend/dist` folder into
    the server's `backend/public` folder.
    -   *Note:* The `index.html` should be directly inside
        `backend/public`.

### Step 3: Backend Configuration

1.  Upload the `backend` folder to your server.
2.  Ensure `server.js` is the application startup file.
3.  Run `npm install` in the cPanel Node.js app interface.
4.  Add your Environment Variables (MONGO_URI, CLOUDINARY\_\*, etc.) in
    the cPanel interface.

### Step 4: Restart

Restart the Node.js application via cPanel. The app handles SPA routing
automatically.

------------------------------------------------------------------------

## ⚙️ Configuration Notes

-   **Upload Limits:** The system supports uploading up to **20 files**
    at once.
-   **Server Timeout:** The server timeout is set to **5 minutes**
    (300,000ms) to handle large video uploads without connection drops.
-   **Max File Size:** Controlled by Cloudinary and server limits.

------------------------------------------------------------------------

## 🔧 Troubleshooting

-   **503 Error on Startup:** Check `stderr.log`. Usually indicates a DB
    connection failure (wrong IP/credentials) or missing Environment
    Variables.
-   **Page Not Found / White Screen:** Ensure the frontend build files
    are correctly placed in `backend/public` and not
    `backend/public/dist`.
-   **Upload Failed:** Check your internet connection or reduce the
    number of files if uploading very large videos.

------------------------------------------------------------------------

## ❤️ Contributing

Contributions, bug reports, and feature requests are welcome. Please
open an issue or PR on the repository.
