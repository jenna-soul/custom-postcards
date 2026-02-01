import React, { useState, useRef } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function Frames() {
  //Frame Logic
  const [orientation, setOrientation] = useState("landscape");
  
  const [frameObj, setFrameObj] = useState(null);
     const loadFrame = (src) => {
    if (!src) {
      setFrameObj(null);
      return;
    }

    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setFrameObj(img);

      if (img.width > img.height) {
        setOrientation("landscape");
      } else {
        setOrientation("portrait");
      }
    };
  };
    return (
    <div>
<h3>Frames from Component</h3>
      <button
        className="controls"
        onClick={() => {
          loadFrame(require("../assets/zion_postcard_png.png"));
        }}
      >
        Zion Vertical
      </button>
      <button
        className="controls"
        onClick={() => {
          loadFrame(require("../assets/zion_postcard_png_h.png"));
        }}
      >
        Zion Horizontal
        </button>
        
    </div>
    )
}

