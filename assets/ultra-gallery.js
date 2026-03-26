class UltraGallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.rotation = 0;
    this.currentIndex = 0;
    this.isLightboxOpen = false;
  }

  connectedCallback() {
    this.render();
    this.setupGallery();
    this.startAutoPlay();
    this.addEventListeners();
    this.updateItemStyles();
  }

  setupGallery() {
    const slot = this.shadowRoot.querySelector('slot');
    this.items = slot.assignedElements();
    const itemCount = this.items.length;
    const itemWidth = 240;
    this.stepAngle = 360 / itemCount;
    this.radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / itemCount)) + 60;

    this.items.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.cursor = 'zoom-in';
      item.style.transition = 'all 0.8s cubic-bezier(0.2, 0, 0, 1)';
      item.style.webkitBoxReflect = 'below 2px linear-gradient(transparent 80%, rgba(255,255,255,0.05))';
      
      // Click logic: If it's the front item, open lightbox. If not, rotate to it.
      item.onclick = (e) => {
        if (this.currentIndex === i) {
          this.openLightbox(item);
        } else {
          this.goToIndex(i);
        }
      };
    });

    this.createDots(itemCount);
  }

  updateItemStyles() {
    this.items.forEach((item, i) => {
      const itemAngle = (i * this.stepAngle) + this.rotation;
      const normalizedAngle = ((itemAngle % 360) + 540) % 360 - 180;
      const distance = Math.abs(normalizedAngle);
      
      const scale = Math.max(0.6, 1 - (distance / 180));
      const opacity = Math.max(0.2, 1 - (distance / 100));
      
      item.style.transform = `rotateY(${i * this.stepAngle}deg) translateZ(${this.radius}px) scale(${scale})`;
      item.style.opacity = opacity;
      item.style.zIndex = Math.round(scale * 100);
    });
  }

  openLightbox(item) {
    this.stopAutoPlay();
    this.isLightboxOpen = true;
    const lb = this.shadowRoot.querySelector('.lightbox');
    const lbContent = this.shadowRoot.querySelector('.lightbox-content');
    
    // Clone the element to avoid pulling it out of the 3D stage
    lbContent.innerHTML = '';
    const clone = item.cloneNode(true);
    clone.style = ''; // Reset 3D styles for the lightbox
    lbContent.appendChild(clone);
    
    lb.classList.add('active');
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.shadowRoot.querySelector('.lightbox').classList.remove('active');
    this.startAutoPlay();
  }

  // ... (previous rotate, goToIndex, and createDots methods remain the same)
  rotate(steps) {
    this.rotation += (steps * this.stepAngle);
    this.shadowRoot.querySelector('.stage').style.transform = `rotateY(${this.rotation}deg)`;
    const itemCount = this.items.length;
    this.currentIndex = (this.currentIndex - steps + itemCount) % itemCount;
    this.updateItemStyles();
    this.updateDots();
  }

  updateDots() {
    this.shadowRoot.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === this.currentIndex));
  }

  goToIndex(index) {
    this.stopAutoPlay();
    const itemCount = this.items.length;
    let diff = index - this.currentIndex;
    if (Math.abs(diff) > itemCount / 2) diff = diff > 0 ? diff - itemCount : diff + itemCount;
    this.rotate(-diff);
  }

  startAutoPlay() {
    if (this.autoPlayTimer || this.isLightboxOpen) return;
    this.autoPlayTimer = setInterval(() => this.rotate(-1), 4000);
  }

  stopAutoPlay() {
    clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
  }

  addEventListeners() {
    this.shadowRoot.querySelector('.lightbox').onclick = () => this.closeLightbox();
    // Keyboard support
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowRight') this.rotate(-1);
      if (e.key === 'ArrowLeft') this.rotate(1);
    });
  }

  createDots(count) {
    const container = this.shadowRoot.querySelector('.dots-container');
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.onclick = (e) => { e.stopPropagation(); this.goToIndex(i); };
      container.appendChild(dot);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; background: #cecece; color: white; padding: 0.25rem 0; font-family: system-ui; border-radius: 1rem}
        .gallery-container { perspective: 2000px; height: 21rem; display: flex; align-items: center; justify-content: center; }
        .stage { width: 440px; height: 290px; position: relative; transform-style: preserve-3d; transition: transform 1s cubic-bezier(0.2, 0, 0, 1); }
        ::slotted(*) { width: 440px; height: 260px; margin-top: 1rem; border-radius: 20px; object-fit: cover; }
        
        /* Lightbox Styles */
        .lightbox {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: 0.4s; z-index: 1000;
          backdrop-filter: blur(10px);
        }
        .lightbox.active { opacity: 1; pointer-events: auto; }
        .lightbox-content { transform: scale(0.8); transition: 0.5s cubic-bezier(0.1, 0.9, 0.2, 1); max-width: 90vw; }
        .lightbox.active .lightbox-content { transform: scale(1); }
        .lightbox-content ::slotted(*), .lightbox-content * { width: auto; max-height: 80vh; border-radius: 12px; box-shadow: 0 0 50px rgba(255,255,255,0.1); }
        
        .dots-container { display: flex; justify-content: center; gap: 12px; margin-top: 0.25rem; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: 0.3s; }
        .dot.active { background: #fff; width: 24px; border-radius: 10px; }
      </style>
      <div class="gallery-container">
        <div class="stage"><slot></slot></div>
      </div>
      <div class="dots-container"></div>
      <div class="lightbox"><div class="lightbox-content"></div></div>
    `;
  }
}
customElements.define('ultra-gallery', UltraGallery);
