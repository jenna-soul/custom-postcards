import React, { useRef, useEffect, useState } from "react";
import { Canvas, Image as FabricImage, Rect } from "fabric";

const CustomCanvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    console.log("✅ Fabric canvas created:", canvas);

    // Draw test rectangle
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: "red",
      width: 100,
      height: 100,
    });
    canvas.add(rect);
    canvas.renderAll();

    return () => {
      console.log("🧹 Disposing Fabric canvas");
      canvas.dispose();
    };
  }, []); // Only run once

  useEffect(() => {
    if (!imageURL || !fabricCanvasRef.current) return;

    requestAnimationFrame(() => {
      FabricImage.fromURL(imageURL, (img) => {
        if (!img) {
          console.error("❌ Could not load image");
          return;
        }

        console.log("✅ Image loaded into Fabric:", img);

        const canvas = fabricCanvasRef.current;
        canvas.clear();
        canvas.add(img);
        canvas.renderAll();
      });
    });
  }, [imageURL]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    console.log("📷 Created blob URL from upload:", url);
    setImageURL(url);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <br />
      <canvas
        ref={canvasRef}
        style={{ border: "2px solid blue", display: "block", background: "#eee" }}
      />
    </div>
  );
};

export default CustomCanvas;
