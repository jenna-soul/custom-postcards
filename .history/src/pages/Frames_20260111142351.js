import React, { useState, useRef } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function Frames() {
    //Frame Logic
    
    return (
    <div>
            <h3>Frames from Component</h3>
<section
  id="thumbnail-carousel"
  class="splide"
  aria-label="The carousel with thumbnails. Selecting a thumbnail will change the Beautiful Gallery carousel."
>
  <div class="splide__track">
		<ul class="splide__list">
			<li class="splide__slide">
				<img src="thumbnail01.jpg" alt="">
			</li>
			<li class="splide__slide">
				<img src="thumbnail02.jpg" alt="">
			</li>
			<li class="splide__slide">
				<img src="thumbnail03.jpg" alt="">
			</li>
		</ul>
  </div>
</section>
    </div>
    )
}

