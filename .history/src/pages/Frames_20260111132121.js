import React, { useState, useRef } from "react";

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
    return
    <div>

      <button
        className="controls"
        onClick={() => {
          loadFrame(require("./assets/zion_postcard_png.png"));
        }}
      >
        Zion Vertical
      </button>
      <button
        className="controls"
        onClick={() => {
          loadFrame(require("./assets/zion_postcard_png_h.png"));
        }}
      >
        Zion Horizontal
        </button>
        
    </div>
    
}

