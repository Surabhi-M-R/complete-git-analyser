class MatrixRain {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = {
      speed: options.speed || 1,
      density: options.density || 0.9,
      glow: options.glow !== false,
      ...options
    };
    
    // Katakana + ASCII for a "hacker terminal" vibe
    this.charset = "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=%\"'#&_(),.;:!?[]{}<>^~".split("");
    
    this.width = 0;
    this.height = 0;
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.running = !this.prefersReducedMotion;
    
    // Column state
    this.fontSize = 16;
    this.cols = 0;
    this.drops = [];
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.setupEventListeners();
    this.loop();
  }
  
  initColumns() {
    this.fontSize = Math.max(14, Math.floor(Math.min(this.width, this.height) / 40));
    this.cols = Math.max(1, Math.floor((this.width / this.fontSize) * this.options.density));
    this.drops = new Array(this.cols).fill(0).map(() => Math.floor(Math.random() * -50));
    this.ctx.font = `${this.fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
  }
  
  resize() {
    const { clientWidth, clientHeight } = this.canvas;
    this.width = clientWidth;
    this.height = clientHeight;
    this.canvas.width = Math.floor(clientWidth * this.dpr);
    this.canvas.height = Math.floor(clientHeight * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.fillStyle = "#000000"; // black canvas background
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.initColumns();
  }
  
  draw() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.08)"; // black fade trail
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // neon green glyphs
    this.ctx.fillStyle = "#00ff5f";
    if (this.options.glow) {
      this.ctx.shadowColor = "#000000";
      this.ctx.shadowBlur = 8;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    for (let i = 0; i < this.cols; i++) {
      const char = this.charset[Math.floor(Math.random() * this.charset.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;
      this.ctx.fillText(char, x, y);
      
      if (y > this.height && Math.random() > 0.985) {
        this.drops[i] = Math.floor(Math.random() * -20);
      }
      this.drops[i] += Math.max(1, this.options.speed);
    }
  }
  
  loop() {
    if (this.running) this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }
  
  setupEventListeners() {
    const onResize = () => this.resize();
    const onVisChange = () => {
      this.running = !document.hidden && !this.prefersReducedMotion;
    };
    
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisChange);
    
    // Store references for cleanup
    this.cleanup = () => {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }
  
  destroy() {
    if (this.cleanup) this.cleanup();
  }
}

// Auto-initialize if canvas element exists
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('matrix-canvas');
  if (canvas) {
    window.matrixRain = new MatrixRain(canvas, {
      speed: 1,
      density: 0.9,
      glow: true
    });
  }
});
