(() => {
  // Configuration
  const TOTAL_FRAMES = 240;
  const FRAME_PATH_PREFIX = 'frames/frame_';
  const FRAME_PATH_EXT = '.jpg';
  const LERP_FACTOR = 0.085; // Silky smooth damping for 60/120Hz displays

  // DOM Elements
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const progressBar = document.getElementById('progress-bar');
  const backToTopBtn = document.getElementById('back-to-top');
  const timeDisplay = document.getElementById('mumbai-time');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  // State
  const images = new Array(TOTAL_FRAMES + 1);
  let loadedCount = 0;
  let targetProgress = 0; // [0, 1]
  let currentProgress = 0;
  let lastRenderedFrame = -1;
  let isCanvasSized = false;
  let resizeRAF = null;

  // Format frame URL: index 1 -> "frames/frame_0001.jpg"
  function getFrameUrl(index) {
    const padded = String(index).padStart(4, '0');
    return `${FRAME_PATH_PREFIX}${padded}${FRAME_PATH_EXT}`;
  }

  // Maximum scrollable distance of the document
  function getMaxScroll() {
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    return Math.max(1, docHeight - window.innerHeight);
  }

  // Canvas resize with HiDPI / Retina backing store (capped at 2 for mobile GPU efficiency)
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    isCanvasSized = true;

    // Redraw immediately after resize
    const activeFrame = getBestLoadedFrame(Math.round(1 + currentProgress * (TOTAL_FRAMES - 1)));
    if (activeFrame) {
      renderFrame(activeFrame);
    }
  }

  function onWindowResize() {
    if (resizeRAF) cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(resizeCanvas);
  }

  // Draw image on canvas with responsive 'cover' aspect-ratio math
  function renderFrame(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cWidth = canvas.width;
    const cHeight = canvas.height;
    const iWidth = img.naturalWidth;
    const iHeight = img.naturalHeight;

    const scale = Math.max(cWidth / iWidth, cHeight / iHeight);
    const drawWidth = iWidth * scale;
    const drawHeight = iHeight * scale;

    const x = (cWidth - drawWidth) * 0.5;
    
    // Vertical framing anchor:
    // On portrait mobile (drawHeight === cHeight), y is 0.
    // On landscape screens (drawHeight > cHeight), anchor at 0.22 so head has comfortable headroom.
    const y = (cHeight - drawHeight) * 0.22;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  }

  // Retrieve requested frame, or closest available loaded frame (guarantees zero flicker)
  function getBestLoadedFrame(targetIdx) {
    targetIdx = Math.max(1, Math.min(TOTAL_FRAMES, targetIdx));

    if (images[targetIdx] && images[targetIdx].complete && images[targetIdx].naturalWidth > 0) {
      return images[targetIdx];
    }

    // Bidirectional scan for closest ready frame
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIdx - offset;
      if (prev >= 1 && images[prev] && images[prev].complete && images[prev].naturalWidth > 0) {
        return images[prev];
      }
      const next = targetIdx + offset;
      if (next <= TOTAL_FRAMES && images[next] && images[next].complete && images[next].naturalWidth > 0) {
        return images[next];
      }
    }
    return null;
  }

  // Synchronize scroll progress from native window scroll
  function updateScrollProgress() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const maxScroll = getMaxScroll();
    
    if (maxScroll > 0) {
      targetProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    }

    if (progressBar) {
      progressBar.style.width = `${(targetProgress * 100).toFixed(2)}%`;
    }
  }

  // Animation Loop (requestAnimationFrame)
  function animate() {
    // Interpolate currentProgress toward targetProgress (Lerp)
    const delta = targetProgress - currentProgress;
    if (Math.abs(delta) > 0.0001) {
      currentProgress += delta * LERP_FACTOR;
    } else {
      currentProgress = targetProgress;
    }

    const frameToDraw = Math.round(1 + currentProgress * (TOTAL_FRAMES - 1));

    if (frameToDraw !== lastRenderedFrame && isCanvasSized) {
      const img = getBestLoadedFrame(frameToDraw);
      if (img) {
        renderFrame(img);
        lastRenderedFrame = frameToDraw;
      }
    }

    requestAnimationFrame(animate);
  }

  // Preloading Strategy: Priority 1 loads first, then background stream
  function preloadImages() {
    const firstImg = new Image();
    firstImg.src = getFrameUrl(1);
    images[1] = firstImg;

    firstImg.onload = () => {
      loadedCount++;
      if (isCanvasSized) {
        renderFrame(firstImg);
        lastRenderedFrame = 1;
      }
      loadRemainingFrames();
    };

    firstImg.onerror = () => {
      loadRemainingFrames();
    };
  }

  function loadRemainingFrames() {
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      images[i] = img;

      img.onload = () => {
        loadedCount++;
      };

      img.onerror = () => {
        loadedCount++;
      };
    }
  }

  // Mobile Navigation Drawer Toggle
  function initMobileNav() {
    if (!mobileMenuBtn || !mobileNavDrawer) return;

    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNavDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close when clicking any nav link
    const links = mobileNavDrawer.querySelectorAll('.m-nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileNavDrawer.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  function openMobileNav() {
    mobileMenuBtn.classList.add('active');
    mobileNavDrawer.classList.add('open');
  }

  function closeMobileNav() {
    mobileMenuBtn.classList.remove('active');
    mobileNavDrawer.classList.remove('open');
  }

  // Back to Top Button
  function initBackToTop() {
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Live Mumbai Time Clock
  function updateTime() {
    if (!timeDisplay) return;
    try {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      timeDisplay.textContent = formatter.format(now);
    } catch (e) {
      const d = new Date();
      timeDisplay.textContent = d.toLocaleTimeString();
    }
  }

  // Initialization
  function init() {
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('orientationchange', onWindowResize, { passive: true });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    resizeCanvas();
    updateScrollProgress();
    preloadImages();
    initMobileNav();
    initBackToTop();
    
    updateTime();
    setInterval(updateTime, 1000);

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
