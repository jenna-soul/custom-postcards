import React, { useState, useRef } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function Frames() {
    //Frame Logic
    
const images = [
  {
    original: "../assets/zion_postcard_png.png",
    thumbnail: "../assets/zion_postcard_png.png",
  },
  {
    original: "https://picsum.photos/id/1015/1000/600/",
    thumbnail: "../assets/zion_postcard_png_h.png",
  },
  {
    original: "https://picsum.photos/id/1019/1000/600/",
    thumbnail: "https://picsum.photos/id/1019/250/150/",
  },
];

    return (
    <div>
            <h3>Frames from Component</h3>
<ImageGallery
  items={images}
  showPlayButton={false}
  showFullscreenButton={false}
  showNav={false}
  showBullets={false}
  showIndex={false}
  showThumbnails={true}
  renderItem={() => null}
/>
    </div>
    )
}

