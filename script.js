// JavaScript Document
/* Interactive Map */
window.addEventListener("load", () => {
  document.getElementById("map-frame").src =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.117120613766!2d-1.8852510235992762!3d52.46488047204739!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bd685ad0bcb5%3A0xe34cb3d4d820b0be!2sJoseph%20Chamberlain%20College!5e0!3m2!1sen!2suk!4v1700000000000";
});

/* Image Magnifier */
document.addEventListener('DOMContentLoaded', () => {
  const selectors = '.achievement-images img, .achievement-images2 img';
  const images = Array.from(document.querySelectorAll(selectors));
  if (!images.length) return;

  // Lens
  const lens = document.createElement('div');
  lens.className = 'magnifier-lens';
  lens.style.position = 'fixed';
  lens.style.pointerEvents = 'none';
  lens.style.display = 'none';
  lens.style.zIndex = '9999';
  document.body.appendChild(lens);

  // Controls (so CSS can control it)
  function getLensSize() {
    const cs = window.getComputedStyle(lens);
    const w = parseFloat(cs.width) || lens.offsetWidth || 160;
    const h = parseFloat(cs.height) || lens.offsetHeight || 160;
    return { w, h };
  }

  const ZOOM = 2; // adjust zoom here

  function activateImg(img) {
    // makinh sure natural sizes are available
    if (!img.complete) {
      img.addEventListener('load', () => activateImg(img), { once: true });
      return;
    }

    // Real src from HTML
    const src = img.getAttribute("src");
    lens.style.backgroundImage = `url("${src}")`;

    function moveHandler(clientX, clientY) {
      const rect = img.getBoundingClientRect();
      // If cursor is outside the image, hide lens right here
      if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
        lens.style.display = 'none';
        return;
      }

      // Natural image sizes
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;
      if (!natW || !natH) return;

      // Position of pointer relative to image visible box
      const xInBox = clientX - rect.left;
      const yInBox = clientY - rect.top;

      // handle object-fit: cover
      const scaleCover = Math.max(rect.width / natW, rect.height / natH);
      const dispW = natW * scaleCover;
      const dispH = natH * scaleCover;

      const overflowX = Math.max(0, (dispW - rect.width) / 2);
      const overflowY = Math.max(0, (dispH - rect.height) / 2);

      const xInDisplayed = xInBox + overflowX;
      const yInDisplayed = yInBox + overflowY;

      const xInNatural = (xInDisplayed / dispW) * natW;
      const yInNatural = (yInDisplayed / dispH) * natH;

      const bgW = natW * ZOOM;
      const bgH = natH * ZOOM;
      lens.style.backgroundSize = `${Math.round(bgW)}px ${Math.round(bgH)}px`;

      const { w: lensW, h: lensH } = getLensSize();
      const halfW = lensW / 2;
      const halfH = lensH / 2;

      const bgLeft = Math.round(halfW - xInNatural * ZOOM);
      const bgTop  = Math.round(halfH - yInNatural * ZOOM);
      lens.style.backgroundPosition = `${bgLeft}px ${bgTop}px`;

      let left = clientX - halfW;
      let top  = clientY - halfH;

      const minLeft = rect.left;
      const maxLeft = rect.right - lensW;
      const minTop = rect.top;
      const maxTop = rect.bottom - lensH;

      if (left < minLeft) left = minLeft;
      if (left > maxLeft) left = maxLeft;
      if (top < minTop) top = minTop;
      if (top > maxTop) top = maxTop;

      lens.style.left = `${Math.round(left)}px`;
      lens.style.top  = `${Math.round(top)}px`;
      lens.style.display = 'block';
    }

    function onMouseMove(e) { moveHandler(e.clientX, e.clientY); }
    function onMouseLeave() { lens.style.display = 'none'; }

    img.addEventListener('mousemove', onMouseMove);
    img.addEventListener('mouseleave', onMouseLeave);

    function onTouchMove(e) {
      const t = e.touches[0];
      if (!t) return;
      moveHandler(t.clientX, t.clientY);
      e.preventDefault();
    }
    function onTouchEnd() { lens.style.display = 'none'; }

    img.addEventListener('touchmove', onTouchMove, { passive: false });
    img.addEventListener('touchend', onTouchEnd);

    const hideFn = () => { lens.style.display = 'none'; };
    window.addEventListener('scroll', hideFn, true);
    window.addEventListener('resize', hideFn);

    img._magnifierCleanup = () => {
      img.removeEventListener('mousemove', onMouseMove);
      img.removeEventListener('mouseleave', onMouseLeave);
      img.removeEventListener('touchmove', onTouchMove);
      img.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', hideFn, true);
      window.removeEventListener('resize', hideFn);
    };
  }

  images.forEach(img => {
    if (img._magnifierCleanup) img._magnifierCleanup();
    activateImg(img);
  });
});

// Select elements
const images = document.querySelectorAll('.gallery-grid img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeBtn = document.querySelector('.close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentIndex = 0;

// Splits caption into date + description and inserts .caption-date span
function formatCaption(rawCaption) {
    // Find the first period (the split point)
    const firstPeriodIndex = rawCaption.indexOf('.');

    // If no period found, treat whole caption as date
    if (firstPeriodIndex === -1) {
        return `<span class="caption-date">${rawCaption}</span>`;
    }

    // Extract parts
    const dateText = rawCaption.substring(0, firstPeriodIndex).trim();
    const descText = rawCaption.substring(firstPeriodIndex + 1).trim();

    // Return HTML with span included
    return `
        <span class="caption-date">${dateText}</span>
        ${descText}
    `;
}

// Lightbox
// Open Lightbox
function openLightbox(index) {
    currentIndex = index;
    const img = images[index];

    lightboxImg.src = img.src;

    // Convert raw caption to formatted HTML
    lightboxCaption.innerHTML = formatCaption(img.dataset.caption);

    lightbox.style.display = 'block';
}

// Close Lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
}

// Prev
function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openLightbox(currentIndex);
}

// Next
function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    openLightbox(currentIndex);
}

// Click images to open
images.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
});

// Buttons
closeBtn.addEventListener('click', closeLightbox);
prevBtn.addEventListener('click', showPrev);
nextBtn.addEventListener('click', showNext);

// Close when clicking outside image
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'block') {
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'Escape') closeLightbox();
    }
});

/* TOASTY! */
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after animation ends (3.4 seconds)
  setTimeout(() => {
    toast.remove();
  }, 3400);
}