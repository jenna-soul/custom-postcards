import React from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

// Function to import all images from a folder
const importAll = (r) => r.keys().map(r);

// Import all images from ../assets folder
const imagesArray = importAll(require.context("../assets", false, /\.(png|jpe?g|svg)$/));

// Convert to format expected by react-image-gallery
const galleryItems = imagesArray.map((img) => ({
  original: img,   // large image
  thumbnail: img,  // can use same image for thumbnail
}));

export default function Frames() {
  return (
    <div>
      <h3>Frames Carousel</h3>
      <ImageGallery
        items={galleryItems}
        showPlayButton={false}
        showFullscreenButton={false}
        showBullets={true}
      />
    </div>
  );
}
