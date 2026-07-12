import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBorderNone,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faUpload,
  faPrint,
  faRotate,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import Frames from "./pages/Frames";

const POSTCARD_SIZES = {
  portrait:  { width: 400, height: 600 },
  landscape: { width: 600, height: 400 }
};

const MAX_SCALE = 3;

const ImageEditorKonva = ({ location }) => {
  const [imageUrl,    setImageUrl]    = useState(null);
  const [imageScale,  setImageScale]  = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [frameUrl,    setFrameUrl]    = useState(null);
  const [orientation, setOrientation] = useState("landscape");
  // useImage handles all load-timing concerns for Konva
  const [imageObj]  = useImage(imageUrl  || '');
  const [frameObj]  = useImage(frameUrl  || '');

  const stageRef   = useRef(null);
  const wrapperRef = useRef(null);
  const pinchRef   = useRef(null);
  const imageRef   = useRef(null);

  const CANVAS_WIDTH  = POSTCARD_SIZES[orientation].width;
  const CANVAS_HEIGHT = POSTCARD_SIZES[orientation].height;

  // ── Responsive display scale ────────────────────────────────────────────────
  // The Konva Stage keeps CANVAS_WIDTH/HEIGHT as its internal "design" coordinate
  // system (imagePosition/imageScale math all assumes this), but on small or
  // landscape-phone screens that box doesn't fit. Instead of relying on the
  // 768px CSS breakpoint (a landscape phone is often wider than that yet still
  // too narrow for a 170px sidebar + 600px canvas), we measure the actual
  // available space and shrink the Stage's own width/height/scale to fit.
  // Konva accounts for stage scale in all of its own pointer-position math, so
  // dragging/clicking keeps working correctly at any displayScale for free.
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const BORDER = 16; // #printableArea's 8px white border, both sides, added outside its content box
    const recompute = () => {
      const availableWidth = el.clientWidth - BORDER;
      // Use the wrapper's actual position so we account for whatever's
      // already above it (nav bar, heading, sidebar row on mobile) instead
      // of guessing a flat percentage — critical on short landscape-phone
      // viewports where that header content eats a big share of the height.
      const availableHeight = window.innerHeight - el.getBoundingClientRect().top - BORDER - 16;
      const scale = Math.min(
        1,
        availableWidth  / CANVAS_WIDTH,
        availableHeight / CANVAS_HEIGHT
      );
      setDisplayScale(scale > 0 ? scale : 1);
    };

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [CANVAS_WIDTH, CANVAS_HEIGHT]);

  // ── Scale helpers ──────────────────────────────────────────────────────────

  const fitImageToFrame = (img) => {
    if (!img) return;
    const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
    setImageScale(scale);
    setImagePosition({
      x: (CANVAS_WIDTH  - img.width  * scale) / 2,
      y: (CANVAS_HEIGHT - img.height * scale) / 2
    });
  };

  const getMinCoverScale = () => {
    if (!imageObj) return 1;
    return Math.max(CANVAS_WIDTH / imageObj.width, CANVAS_HEIGHT / imageObj.height);
  };

  const clampPosition = (x, y, scale = imageScale) => {
    if (!imageObj) return { x, y };
    const imgW = imageObj.width  * scale;
    const imgH = imageObj.height * scale;
    return {
      x: Math.max(Math.min(0, CANVAS_WIDTH  - imgW), Math.min(0, x)),
      y: Math.max(Math.min(0, CANVAS_HEIGHT - imgH), Math.min(0, y))
    };
  };

  // When a new image loads, auto-match canvas orientation to the photo,
  // then fit it. If orientation doesn't change the other effect won't fire,
  // so we call fitImageToFrame directly in that case.
  useEffect(() => {
    if (!imageObj) return;
    const autoOrientation = imageObj.width >= imageObj.height ? 'landscape' : 'portrait';
    if (autoOrientation === orientation) {
      fitImageToFrame(imageObj);
    } else {
      setOrientation(autoOrientation); // orientation effect will fit the image
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageObj]);

  // Re-fit image and clear mismatched frame whenever orientation changes
  useEffect(() => {
    if (frameObj) {
      const frameIs = frameObj.width > frameObj.height ? "landscape" : "portrait";
      if (frameIs !== orientation) setFrameUrl(null);
    }
    if (imageObj) fitImageToFrame(imageObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation]);

  // ── Frame ──────────────────────────────────────────────────────────────────

  const loadFrame = (src) => {
    setFrameUrl(src || null);
    if (src) {
      // Auto-switch orientation to match the frame
      const img = new window.Image();
      img.onload = () =>
        setOrientation(img.width > img.height ? "landscape" : "portrait");
      img.src = src;
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  // createImageBitmap with imageOrientation:'from-image' bakes EXIF rotation
  // into the pixel data so portrait phone photos aren't displayed sideways.
  // The corrected bitmap is drawn to a canvas and exported as a data URL.

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';

    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const canvas = document.createElement('canvas');
      canvas.width  = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      bitmap.close();
      setImageUrl(canvas.toDataURL('image/jpeg', 0.92));
    } catch {
      // Fallback for browsers that don't support imageOrientation option
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ── Zoom ───────────────────────────────────────────────────────────────────

  const zoom = (direction) => {
    if (!imageObj) return;
    const minScale = getMinCoverScale();
    const factor   = direction === "in" ? 1.2 : 1 / 1.2;

    setImageScale(prevScale => {
      const nextScale  = Math.max(minScale, Math.min(prevScale * factor, MAX_SCALE));
      const centerX    = CANVAS_WIDTH  / 2;
      const centerY    = CANVAS_HEIGHT / 2;
      const imgCenterX = (centerX - imagePosition.x) / prevScale;
      const imgCenterY = (centerY - imagePosition.y) / prevScale;
      const clamped    = clampPosition(
        centerX - imgCenterX * nextScale,
        centerY - imgCenterY * nextScale,
        nextScale
      );
      setImagePosition(clamped);
      return nextScale;
    });
  };

  // ── Pinch-to-zoom (mobile) ─────────────────────────────────────────────────
  // Converts each touch point from screen pixels into the Stage's design
  // coordinate space (inverting the stage's absolute transform, which includes
  // displayScale) so the pinch math lines up with imageScale/imagePosition
  // regardless of how small the on-screen canvas is.

  const getTouchDesignPoint = (touch) => {
    const stage = stageRef.current;
    const rect  = stage.container().getBoundingClientRect();
    const rawX  = (touch.clientX - rect.left) * (stage.width()  / rect.width);
    const rawY  = (touch.clientY - rect.top)  * (stage.height() / rect.height);
    return stage.getAbsoluteTransform().copy().invert().point({ x: rawX, y: rawY });
  };

  // Konva starts its own single-finger drag as soon as a touch lands on the
  // (draggable) photo, and while Konva.isDragging() is true it swallows all
  // further pointer/touch events at the Stage level — so a second finger
  // touching down would otherwise never reach handleTouchMove at all. Killing
  // the in-progress drag and toggling draggable off for the duration of the
  // pinch hands control over to our own handler.
  const handleTouchStart = (e) => {
    if (e.evt.touches.length >= 2 && imageRef.current) {
      imageRef.current.stopDrag();
      imageRef.current.draggable(false);
    }
  };

  const handleTouchMove = (e) => {
    const touches = e.evt.touches;
    if (!imageObj || touches.length !== 2) {
      pinchRef.current = null;
      return;
    }
    e.evt.preventDefault();

    const p1     = getTouchDesignPoint(touches[0]);
    const p2     = getTouchDesignPoint(touches[1]);
    const dist   = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    if (!pinchRef.current) {
      pinchRef.current = { dist, center };
      return;
    }

    const minScale = getMinCoverScale();
    const factor   = dist / pinchRef.current.dist;

    setImageScale(prevScale => {
      const nextScale = Math.max(minScale, Math.min(prevScale * factor, MAX_SCALE));
      const imgPointX = (center.x - imagePosition.x) / prevScale;
      const imgPointY = (center.y - imagePosition.y) / prevScale;
      const clamped   = clampPosition(
        center.x - imgPointX * nextScale,
        center.y - imgPointY * nextScale,
        nextScale
      );
      setImagePosition(clamped);
      return nextScale;
    });

    pinchRef.current = { dist, center };
  };

  const handleTouchEnd = (e) => {
    if (e.evt.touches.length < 2) {
      pinchRef.current = null;
      if (imageRef.current) imageRef.current.draggable(true);
    }
  };

  // ── Print ──────────────────────────────────────────────────────────────────
  // Mobile: Web Share API → native share sheet where user picks Print.
  //   No window.open() needed, and no Android/iOS print preview bugs.
  //   That handoff means the OS's own print pipeline (AirPrint / Android print
  //   framework) renders the final page, and most of those default to a
  //   "borderless"/"fill" mode that scales the image up a few percent and
  //   crops the edges to guarantee full bleed regardless of paper-feed
  //   tolerance — commonly ~1/8"-1/4" per side. We can't configure that dialog
  //   from here, so PRINT_SAFE_MARGIN bakes a matching white inset into the
  //   exported image itself: whatever gets auto-cropped eats into that inset
  //   instead of the photo or frame artwork.
  // Desktop: window.open() called synchronously (before async work) so
  //   popup blockers don't trigger, then populate the tab and print.

  const PRINT_SAFE_MARGIN = 0.04; // 4% inset per side (~0.16-0.24in on a 4-6in card)

  const addPrintSafeMargin = (sourceCanvas) => {
    const out = document.createElement('canvas');
    out.width  = sourceCanvas.width;
    out.height = sourceCanvas.height;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    const insetX = out.width  * PRINT_SAFE_MARGIN;
    const insetY = out.height * PRINT_SAFE_MARGIN;
    ctx.drawImage(sourceCanvas, insetX, insetY, out.width - insetX * 2, out.height - insetY * 2);
    return out;
  };

  const handlePrint = () => {
    if (!stageRef.current) return;
    const size = orientation === 'landscape' ? '6in 4in' : '4in 6in';
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const w = isMobile ? null : window.open('', '_blank');

    // pixelRatio compensates for displayScale so export resolution stays
    // constant (CANVAS_WIDTH*2 x CANVAS_HEIGHT*2) regardless of on-screen size.
    const rawCanvas = stageRef.current.toCanvas({ pixelRatio: 2 / displayScale });
    const canvas = isMobile ? addPrintSafeMargin(rawCanvas) : rawCanvas;
    canvas.toBlob(async (blob) => {
      if (!blob) { w?.close(); return; }

      if (isMobile) {
        const file = new File([blob], 'postcard.jpg', { type: 'image/jpeg' });
        if (navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: 'Postcard' });
            return;
          } catch (err) {
            if (err.name === 'AbortError') return;
          }
        }
        // Fallback: download the image so the user can print from Photos/Gallery
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'postcard.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return;
      }

      if (!w) return;
      const blobURL = URL.createObjectURL(blob);
      w.document.write(`<!DOCTYPE html><html><head><style>
        @page { size: ${size}; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
        img { display: block; width: 100%; height: 100%; object-fit: fill; }
      </style></head><body>
        <img src="${blobURL}" onload="window.print();" />
        <script>window.onafterprint = function() { window.close(); };<\/script>
      </body></html>`);
      w.document.close();
      setTimeout(() => URL.revokeObjectURL(blobURL), 120000);
    }, 'image/jpeg', 0.9);
  };

  // ── Orientation toggle ─────────────────────────────────────────────────────

  const toggleOrientation = () =>
    setOrientation(prev => prev === "landscape" ? "portrait" : "landscape");

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="editor-wrapper">

      <div className="sidebar">
        <p className="sidebar-label">Orientation</p>
        <button className="controls" onClick={() => setOrientation("portrait")}>Portrait</button>
        <button className="controls" onClick={() => setOrientation("landscape")}>Landscape</button>
        <button className="controls" onClick={toggleOrientation}>
          <FontAwesomeIcon icon={faRotate} /> Flip
        </button>

        <hr className="sidebar-divider" />

        <button className="controls" onClick={() => loadFrame(null)}>
          <FontAwesomeIcon icon={faBorderNone} /> Clear Frame
        </button>

        <hr className="sidebar-divider" />

        <p className="sidebar-label">Zoom</p>
        <div className="zoom-row">
          <button
            className="controls zoom-btn"
            onClick={() => zoom("in")}
            disabled={!imageObj || imageScale >= MAX_SCALE}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
          </button>
          <button
            className="controls zoom-btn"
            onClick={() => zoom("out")}
            disabled={!imageObj || imageScale <= getMinCoverScale()}
          >
            <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
          </button>
        </div>

        <hr className="sidebar-divider" />

        <p className="sidebar-label">Photo</p>
        {/* Opens rear camera directly on mobile */}
        <label htmlFor="camera-capture" className="controls">
          <FontAwesomeIcon icon={faCamera} /> Take Photo
        </label>
        <input
          id="camera-capture"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        {/* Choose from gallery / file system */}
        <label htmlFor="file-upload" className="controls">
          <FontAwesomeIcon icon={faUpload} /> Upload
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />

        <hr className="sidebar-divider" />

        <button className="controls print-btn" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} /> Print
        </button>
      </div>

      <div className="content">
        <div className="stage-wrapper" ref={wrapperRef}>
          <div
            id="printableArea"
            style={{ width: CANVAS_WIDTH * displayScale, height: CANVAS_HEIGHT * displayScale, position: 'relative' }}
          >
            <Stage
              ref={stageRef}
              width={CANVAS_WIDTH * displayScale}
              height={CANVAS_HEIGHT * displayScale}
              scaleX={displayScale}
              scaleY={displayScale}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >

              {/* Layer 1 – user photo */}
              <Layer>
                {imageObj && (
                  <KonvaImage
                    ref={imageRef}
                    image={imageObj}
                    x={imagePosition.x}
                    y={imagePosition.y}
                    width={imageObj.width  * imageScale}
                    height={imageObj.height * imageScale}
                    draggable
                    dragBoundFunc={(pos) => clampPosition(pos.x, pos.y)}
                    onDragEnd={(e) =>
                      setImagePosition({ x: e.target.x(), y: e.target.y() })
                    }
                  />
                )}
              </Layer>

              {/* Layer 2 – frame overlay (always on top, non-interactive) */}
              <Layer>
                {frameObj && (
                  <KonvaImage
                    image={frameObj}
                    x={0}
                    y={0}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    listening={false}
                  />
                )}
              </Layer>

            </Stage>

            {/* Empty state — clicking opens the file picker */}
            {!imageObj && (
              <label htmlFor="file-upload" className="canvas-empty-state">
                <FontAwesomeIcon icon={faCamera} size="2x" />
                <span>Tap to add a photo</span>
              </label>
            )}
          </div>
        </div>

        <Frames
          onSelectFrame={(src) => loadFrame(src)}
          orientation={orientation}
          location={location}
        />
      </div>


    </div>
  );
};

export default ImageEditorKonva;
