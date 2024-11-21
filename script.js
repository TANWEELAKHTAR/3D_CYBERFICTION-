function locomotive() {
  const lenis = new Lenis();
  requestAnimationFrame(function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  });
}
locomotive();

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const frames = {
  currentIndex: 0,
  maxindex: 300
};

// Use a Map instead of Array for better memory management
const images = new Map();
let loadedCount = 0;
let currentLoadBatch = 0;
const BATCH_SIZE = 50; // Load images in smaller batches

function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loadImage(frames.currentIndex);
}

function loadImage(index) {
  if (index < 0 || index > frames.maxindex) return;
  
  const img = images.get(index);
  if (!img) return;

  // Cache canvas dimensions
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const scaleX = canvasWidth / img.width;
  const scaleY = canvasHeight / img.height;
  const scale = Math.max(scaleX, scaleY);

  const newWidth = img.width * scale;
  const newHeight = img.height * scale;
  const offsetX = (canvasWidth - newWidth) / 2;
  const offsetY = (canvasHeight - newHeight) / 2;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(img, offsetX, offsetY, newWidth, newHeight);
  
  frames.currentIndex = index;
}

function loadImageBatch() {
  const start = currentLoadBatch * BATCH_SIZE + 1;
  const end = Math.min(start + BATCH_SIZE - 1, frames.maxindex);

  for (let i = start; i <= end; i++) {
    const img = new Image();
    const index = i - 1;
    img.src = `./images/male${i.toString().padStart(4, "0")}.png`;
    img.onload = () => {
      images.set(index, img);
      loadedCount++;
      
      if (loadedCount === frames.maxindex) {
        loadImage(frames.currentIndex);
        startAnimation();
        window.addEventListener("resize", handleResize);
      }
    };
  }

  currentLoadBatch++;
  if (end < frames.maxindex) {
    // Load next batch after a small delay
    setTimeout(loadImageBatch, 100);
  }
}

function startAnimation() {
  gsap.timeline({
    scrollTrigger: {
      trigger: ".parent",
      start: "top top", 
      scrub: 2
    }
  }).to(frames, {
    currentIndex: frames.maxindex,
    onUpdate: () => {
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => loadImage(Math.floor(frames.currentIndex)));
    }
  });
}

// Set initial canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Start loading images in batches
loadImageBatch();