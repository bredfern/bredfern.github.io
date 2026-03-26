class UltraGallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.rotation = 0;
    this.currentIndex = 0;
    this.autoPlayTimer = null;
  }

  connectedCallback() {
    this.render();
    this.setupGallery();
    this.startAutoPlay();
    this.addEventListeners();
    // Initial scale update
    this.updateItemStyles();
  }

  setupGallery() {
    const slot = this.shadowRoot.querySelector('slot');
    this.items = slot.assignedElements();
    const itemCount = this.items.length;
    
    const itemWidth = 240;
    this.stepAngle = 360 / itemCount;
    // Increased radius slightly for a more "airy" feel
    this.radius = Math.round((itemWidth / 2) / Math.tan(Math.PI / itemCount)) + 50;

    this.items.forEach((item, i) => {
      item.style.position = 'absolute';
      item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      item.style.webkitBoxReflect = 'below 2px linear-gradient(transparent 70%, rgba(255,255,255,0.1))';
    });

    this.createDots(itemCount);
  }

  // New: Updates opacity and scale based on rotation
  updateItemStyles() {
    this.items.forEach((item, i) => {
      const itemAngle = (i * this.stepAngle) + this.rotation;
      // Normalize angle to -180 to 180
      const normalizedAngle = ((itemAngle % 360) + 540) % 360 - 180;
      
      // Calculate distance from front (0 degrees)
      const distance = Math.abs(normalizedAngle);
      const scale = Math.max(0.7, 1 - (distance / 180));
      const opacity = Math.max(0.3, 1 - (distance / 120));

      item.style.transform = `rotateY(${i * this.stepAngle}deg) translateZ(${this.radius}px) scale(${scale})`;
      item.style.opacity = opacity;
    });
  }

  createDots(count) {
    const container = this.shadowRoot.querySelector('.dots-container');
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === 0 ? 'active' : ''}`;
      dot.onclick = () => this.goToIndex(i);
      container.appendChild(dot);
    }
  }

  rotate(steps) {
    this.rotation += (steps * this.stepAngle);
    this.shadowRoot.querySelector('.stage').style.transform = `rotateY(${this.rotation}deg)`;
    this.updateItemStyles();
    
    // Update Dot UI
    const itemCount = this.items.length;
    this.currentIndex = (this.currentIndex - steps + itemCount) % itemCount;
    this.shadowRoot.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === this.currentIndex);
    });
  }

  goToIndex(index) {
    this.stopAutoPlay();
    const itemCount = this.items.length;
    // Calculate shortest path
    let diff = index - this.currentIndex;
    if (Math.abs(diff) > itemCount / 2) {
      diff = diff > 0 ? diff - itemCount : diff + itemCount;
    }
    this.rotate(-diff);
    setTimeout(() => this.startAutoPlay(), 8000);
  }

  startAutoPlay() {
    if (this.autoPlayTimer) return;
    this.autoPlayTimer = setInterval(() => this.rotate(-1), 4000);
  }

  stopAutoPlay() {
    clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
  }

  addEventListeners() {
    const stage = this.shadowRoot.querySelector('.stage');
    let startX = 0;

    this.addEventListener('touchstart', e => {
      this.stopAutoPlay();
      startX = e.touches[0].clientX;
    }, {passive: true});

    this.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) this.rotate(diff > 0 ? -1 : 1);
      setTimeout(() => this.startAutoPlay(), 8000);
    }, {passive: true});
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: transparent;
          color: white;
          padding: 0.1rem 0;
          --accent: #0071e3;
        }
        .gallery-container {
          perspective: 125rem;
          height: 28rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stage {
          width: 100%;
          height: 20rem;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1s cubic-bezier(0.2, 0, 0, 1);
        }
        ::slotted(*) {
          width: 100%;
          height: 20rem;
          border-radius: 1.125rem;
          object-fit: cover;
          box-shadow: 0 1.25rem 2.5rem rgba(0,0,0,0.5);
        }
        .dots-container {
          display: flex;
          justify-content: center;
          gap: 0;
          margin-top: 0.25rem;
        }
        .dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: 0.4s;
        }
        .dot.active {
          background: white;
          width: 1.5rem;
          border-radius: 0.625rem;
        }
      </style>
      <div class="gallery-container">
        <div class="stage"><slot></slot></div>
      </div>
      <div class="dots-container"></div>
    `;
  }
}

customElements.define('ultra-gallery', UltraGallery);
