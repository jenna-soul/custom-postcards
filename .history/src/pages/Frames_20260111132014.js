export default function Frames() {
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

