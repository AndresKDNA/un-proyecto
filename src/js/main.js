/**
 * ====================================================================
 * ARTPOP LAB - JAVASCRIPT CONTROLLER
 * Full interactive logic: Dark Mode, DIY Studio, Cart Drawer, Modal,
 * Toast Notifications & Dynamic Filtering.
 * ====================================================================
 */

// 1. STATE MANAGEMENT
const state = {
  theme: 'light',
  cart: [
    {
      id: 'drop-01',
      title: 'Roy Screaming Poster (Halftone)',
      price: 49.99,
      category: 'posters',
      qty: 1,
      image: 'poster-roy'
    },
    {
      id: 'drop-03',
      title: 'Neon Banana Vinyl Figurine',
      price: 89.00,
      category: 'toys',
      qty: 1,
      image: 'toy-banana'
    }
  ],
  diy: {
    text: 'POP! NEVER SLEEPS',
    bgColor: '#FFE600',
    textColor: '#111116',
    pattern: 'dots',
    sticker: 'boom',
    badge: '100% POP'
  },
  products: [
    {
      id: 'drop-01',
      title: 'Roy Screaming Poster (Halftone)',
      subtitle: 'Impresión litográfica en serigrafía a 4 tintas con micro-semitonos',
      price: 49.99,
      originalPrice: 65.00,
      badge: 'Bestseller',
      badgeColor: 'bg-[#FF2A85] text-white',
      category: 'posters',
      icon: 'roy',
      tag: 'Edición de 150 piezas'
    },
    {
      id: 'drop-02',
      title: 'Chaqueta "Comic Blast" Acid Wash',
      subtitle: 'Denim oversize con parches bordados neo-pop y mangas en contraste',
      price: 135.00,
      originalPrice: 170.00,
      badge: 'Hot Drop 🔥',
      badgeColor: 'bg-[#FFE600] text-black',
      category: 'apparel',
      icon: 'jacket',
      tag: 'Tallas S a XXL'
    },
    {
      id: 'drop-03',
      title: 'Neon Banana Vinyl Figurine',
      subtitle: 'Figura coleccionable de vinilo electro-laqueado homenaje a Andy',
      price: 89.00,
      originalPrice: 110.00,
      badge: 'Ultra Raro',
      badgeColor: 'bg-[#00F0FF] text-black',
      category: 'toys',
      icon: 'banana',
      tag: 'Caja coleccionista incluida'
    },
    {
      id: 'drop-04',
      title: 'Zine Antología: "Lichtenstein Vivo"',
      subtitle: 'Fanzine de 84 páginas impreso en papel periódico retro con serigrafía',
      price: 24.50,
      originalPrice: 32.00,
      badge: 'Nuevo!',
      badgeColor: 'bg-[#10FFA0] text-black',
      category: 'zines',
      icon: 'zine',
      tag: 'Incluye stickers holográficos'
    },
    {
      id: 'drop-05',
      title: 'Gafas de Sol "Dot-Matrix 1984"',
      subtitle: 'Marco geométrico de acetato grueso con patrón de puntos y lentes UV400',
      price: 68.00,
      originalPrice: 85.00,
      badge: 'Limitado',
      badgeColor: 'bg-[#FF5E00] text-white',
      category: 'apparel',
      icon: 'glasses',
      tag: 'Funda de cómic vintage'
    },
    {
      id: 'drop-06',
      title: 'Lata "Pop Soup Deluxe" Edición Oro',
      subtitle: 'Escultura de metal serigrafiado coleccionable con acabado mate brillante',
      price: 115.00,
      originalPrice: 140.00,
      badge: 'Exclusivo',
      badgeColor: 'bg-[#7928CA] text-white',
      category: 'toys',
      icon: 'soup',
      tag: 'Numerada y certificada'
    }
  ]
};

// ====================================================================
// 2. DARK MODE INITIALIZATION & CONTROLS
// ====================================================================
function initDarkMode() {
  const savedTheme = localStorage.getItem('artpop_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    enableDarkMode(false);
  } else {
    enableLightMode(false);
  }

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

function enableDarkMode(notify = true) {
  document.documentElement.classList.add('dark');
  localStorage.setItem('artpop_theme', 'dark');
  state.theme = 'dark';
  updateThemeUI();
  if (notify) {
    showToast('🌙 Modo Oscuro Activado: ¡Vibras Neon Nocturnas!');
  }
}

function enableLightMode(notify = true) {
  document.documentElement.classList.remove('dark');
  localStorage.setItem('artpop_theme', 'light');
  state.theme = 'light';
  updateThemeUI();
  if (notify) {
    showToast('☀️ Modo Claro Activado: ¡Lichtenstein Sunlight!');
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    enableLightMode(true);
  } else {
    enableDarkMode(true);
  }
}

function updateThemeUI() {
  const iconSun = document.getElementById('theme-icon-sun');
  const iconMoon = document.getElementById('theme-icon-moon');
  const label = document.getElementById('theme-label');

  const isDark = document.documentElement.classList.contains('dark');
  if (isDark) {
    if (iconSun) iconSun.classList.remove('hidden');
    if (iconMoon) iconMoon.classList.add('hidden');
    if (label) label.textContent = 'NOCHE';
  } else {
    if (iconSun) iconSun.classList.add('hidden');
    if (iconMoon) iconMoon.classList.remove('hidden');
    if (label) label.textContent = 'DÍA';
  }
}

// ====================================================================
// 3. TOAST NOTIFICATIONS
// ====================================================================
function showToast(message, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `transform transition-all duration-300 translate-y-4 opacity-0 flex items-center gap-3 px-5 py-3 font-bold border-3 border-black bg-[#FFE600] text-black pop-shadow-sm text-sm md:text-base pointer-events-auto rounded-none`;
  
  if (type === 'pink') {
    toast.className = toast.className.replace('bg-[#FFE600]', 'bg-[#FF2A85] text-white');
  } else if (type === 'cyan') {
    toast.className = toast.className.replace('bg-[#FFE600]', 'bg-[#00F0FF] text-black');
  }

  toast.innerHTML = `
    <span class="text-xl">💥</span>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-auto text-lg font-black hover:scale-125 transition-transform">✕</button>
  `;

  container.appendChild(toast);

  // Trigger animation in next frame
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ====================================================================
// 4. DIY ARTPOP STUDIO (INTERACTIVE GENERATOR)
// ====================================================================
const STICKER_SVGS = {
  boom: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#FF2A85] drop-shadow-[5px_5px_0px_#000] animate-pulse-grow" viewBox="0 0 100 100" fill="currentColor">
      <path stroke="#000" stroke-width="3" stroke-linejoin="round" d="M50 0 L64 25 L95 15 L85 45 L100 65 L70 75 L75 100 L45 85 L25 100 L30 70 L0 60 L15 35 L0 10 L30 20 Z"/>
      <text x="50" y="58" font-family="Bangers" font-size="22" fill="#FFE600" stroke="#000" stroke-width="1" text-anchor="middle">POW!</text>
    </svg>
  `,
  lip: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#FF0055] drop-shadow-[5px_5px_0px_#000]" viewBox="0 0 100 80" fill="currentColor">
      <path stroke="#000" stroke-width="3" d="M10 40 Q30 10 50 25 Q70 10 90 40 Q70 48 50 48 Q30 48 10 40 Z" fill="#FF1A75"/>
      <path stroke="#000" stroke-width="3" d="M10 40 Q30 50 50 50 Q70 50 90 40 Q75 75 50 75 Q25 75 10 40 Z" fill="#E6005C"/>
      <line x1="12" y1="40" x2="88" y2="40" stroke="#000" stroke-width="3"/>
      <ellipse cx="40" cy="62" rx="10" ry="3" fill="#FFF" opacity="0.7"/>
    </svg>
  `,
  banana: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#FFE600] drop-shadow-[5px_5px_0px_#000]" viewBox="0 0 100 100" fill="currentColor">
      <path stroke="#000" stroke-width="3" d="M85 15 Q40 10 20 50 Q10 70 30 85 Q45 80 50 65 Q60 40 85 20 Z"/>
      <path d="M85 15 Q65 30 50 65" stroke="#7A5C00" stroke-width="2" fill="none"/>
      <polygon points="85,15 92,10 88,18" fill="#4B3800" stroke="#000" stroke-width="1.5"/>
      <circle cx="28" cy="83" r="3" fill="#3D2900"/>
    </svg>
  `,
  lightning: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#00F0FF] drop-shadow-[5px_5px_0px_#000] animate-pop-wiggle" viewBox="0 0 100 100" fill="currentColor">
      <polygon stroke="#000" stroke-width="3" points="55,5 20,55 50,55 35,95 80,45 50,45"/>
    </svg>
  `,
  eye: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#FFE600] drop-shadow-[5px_5px_0px_#000]" viewBox="0 0 100 80" fill="currentColor">
      <path stroke="#000" stroke-width="3.5" d="M10 40 Q50 5 90 40 Q50 75 10 40 Z" fill="#FFF"/>
      <circle cx="50" cy="40" r="18" fill="#00D2FF" stroke="#000" stroke-width="3"/>
      <circle cx="50" cy="40" r="10" fill="#000"/>
      <circle cx="54" cy="36" r="3" fill="#FFF"/>
      <!-- Comic tear -->
      <path stroke="#000" stroke-width="2.5" d="M60 48 Q68 75 58 75 Q50 75 56 50 Z" fill="#00F0FF"/>
    </svg>
  `,
  star: `
    <svg class="w-32 h-32 md:w-44 md:h-44 text-[#FF5E00] drop-shadow-[5px_5px_0px_#000] animate-pop-float" viewBox="0 0 100 100" fill="currentColor">
      <polygon stroke="#000" stroke-width="3" points="50,5 64,35 96,38 72,60 79,92 50,75 21,92 28,60 4,38 36,35"/>
    </svg>
  `
};

function initDiyStudio() {
  const input = document.getElementById('diy-text-input');
  if (input) {
    input.addEventListener('input', (e) => {
      state.diy.text = e.target.value.toUpperCase() || 'POP!';
      renderDiyCanvas();
    });
  }

  // Color selection buttons
  document.querySelectorAll('.diy-color-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      state.diy.bgColor = color;
      document.querySelectorAll('.diy-color-pick').forEach(b => b.classList.remove('ring-4', 'ring-black', 'scale-110'));
      btn.classList.add('ring-4', 'ring-black', 'scale-110');
      renderDiyCanvas();
    });
  });

  // Pattern selection
  document.querySelectorAll('.diy-pattern-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.diy.pattern = btn.dataset.pattern;
      document.querySelectorAll('.diy-pattern-btn').forEach(b => b.classList.remove('bg-black', 'text-white'));
      btn.classList.add('bg-black', 'text-white');
      renderDiyCanvas();
    });
  });

  // Sticker selection
  document.querySelectorAll('.diy-sticker-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.diy.sticker = btn.dataset.sticker;
      document.querySelectorAll('.diy-sticker-btn').forEach(b => b.classList.remove('border-[#FF2A85]', 'scale-110', 'bg-yellow-200'));
      btn.classList.add('border-[#FF2A85]', 'scale-110', 'bg-yellow-200');
      renderDiyCanvas();
    });
  });

  // Randomizer button
  const randomBtn = document.getElementById('diy-random-btn');
  if (randomBtn) {
    randomBtn.addEventListener('click', randomizeDiy);
  }

  // Copy / Share button
  const copyBtn = document.getElementById('diy-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      showToast('🎨 ¡Póster ArtPop guardado en memoria con éxito!', 'pink');
    });
  }

  renderDiyCanvas();
}

function renderDiyCanvas() {
  const canvas = document.getElementById('diy-canvas');
  const textEl = document.getElementById('diy-canvas-text');
  const stickerEl = document.getElementById('diy-canvas-sticker');
  const badgeEl = document.getElementById('diy-canvas-badge');

  if (!canvas) return;

  // Background color
  canvas.style.backgroundColor = state.diy.bgColor;

  // Pattern class
  canvas.className = canvas.className.replace(/bg-halftone-\w+|bg-stripes-\w+|bg-comic-checker/g, '');
  if (state.diy.pattern === 'dots') {
    canvas.classList.add('bg-halftone-dots');
  } else if (state.diy.pattern === 'stripes') {
    canvas.classList.add('bg-stripes-yellow');
  } else if (state.diy.pattern === 'checker') {
    canvas.classList.add('bg-comic-checker');
  }

  // Text
  if (textEl) {
    textEl.textContent = state.diy.text;
  }

  // Sticker SVG
  if (stickerEl) {
    stickerEl.innerHTML = STICKER_SVGS[state.diy.sticker] || STICKER_SVGS.boom;
  }

  // Badge
  if (badgeEl) {
    badgeEl.textContent = state.diy.badge;
  }
}

function randomizeDiy() {
  const colors = ['#FFE600', '#FF2A85', '#00F0FF', '#FF5E00', '#10FFA0', '#FFFFFD'];
  const patterns = ['dots', 'stripes', 'checker', 'clean'];
  const stickers = ['boom', 'lip', 'banana', 'lightning', 'eye', 'star'];
  const slogans = ['WARHOL WAS RIGHT!', 'MORE POP LESS TALK', 'LOUD COLORS ONLY', 'EXPLODE THE GRID', 'NEO-POP REBEL', 'KABOOM!'];
  const badges = ['LIMITADO', '100% POP', 'HOT DROP', 'ICONIC', 'RARE'];

  state.diy.bgColor = colors[Math.floor(Math.random() * colors.length)];
  state.diy.pattern = patterns[Math.floor(Math.random() * patterns.length)];
  state.diy.sticker = stickers[Math.floor(Math.random() * stickers.length)];
  state.diy.text = slogans[Math.floor(Math.random() * slogans.length)];
  state.diy.badge = badges[Math.floor(Math.random() * badges.length)];

  const textInput = document.getElementById('diy-text-input');
  if (textInput) textInput.value = state.diy.text;

  renderDiyCanvas();
  showToast('🎲 ¡Combinación Aleatoria Generada!', 'cyan');
}

// ====================================================================
// 5. PRODUCT CATALOG & CATEGORY FILTERING
// ====================================================================
function initProducts() {
  renderProductGrid('all');

  const filterBtns = document.querySelectorAll('.cat-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filterBtns.forEach(b => {
        b.classList.remove('bg-black', 'text-white', 'dark:bg-[#FFE600]', 'dark:text-black');
        b.classList.add('bg-white', 'text-black', 'dark:bg-[#1E1E2E]', 'dark:text-white');
      });
      btn.classList.add('bg-black', 'text-white', 'dark:bg-[#FFE600]', 'dark:text-black');
      btn.classList.remove('bg-white', 'text-black', 'dark:bg-[#1E1E2E]', 'dark:text-white');
      renderProductGrid(category);
    });
  });
}

function getProductIllustration(icon) {
  switch (icon) {
    case 'roy':
      return `
        <div class="w-full h-48 bg-[#FFE600] flex items-center justify-center relative overflow-hidden bg-halftone-pink border-b-3 border-black">
          <svg class="w-32 h-32 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
            <path stroke="#000" stroke-width="3" d="M20 70 Q50 30 80 70 Q70 95 30 95 Z" fill="#FF2A85"/>
            <circle cx="35" cy="45" r="8" fill="#FFF" stroke="#000" stroke-width="3"/>
            <circle cx="65" cy="45" r="8" fill="#FFF" stroke="#000" stroke-width="3"/>
            <circle cx="35" cy="45" r="4" fill="#000"/>
            <circle cx="65" cy="45" r="4" fill="#000"/>
            <path d="M40 75 Q50 85 60 75" stroke="#000" stroke-width="4" fill="#000"/>
            <polygon points="50,10 60,30 40,30" fill="#00F0FF" stroke="#000" stroke-width="2"/>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">SERIGRAFÍA</span>
        </div>
      `;
    case 'jacket':
      return `
        <div class="w-full h-48 bg-[#00F0FF] flex items-center justify-center relative overflow-hidden bg-stripes-yellow border-b-3 border-black">
          <svg class="w-32 h-32 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
            <path stroke="#000" stroke-width="3" d="M25 25 L40 15 L60 15 L75 25 L85 55 L70 60 L68 90 L32 90 L30 60 L15 55 Z" fill="#FF2A85"/>
            <line x1="50" y1="20" x2="50" y2="90" stroke="#000" stroke-width="3"/>
            <polygon points="45,45 55,45 50,55" fill="#FFE600"/>
            <circle cx="60" cy="70" r="5" fill="#10FFA0" stroke="#000" stroke-width="2"/>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">STREETWEAR</span>
        </div>
      `;
    case 'banana':
      return `
        <div class="w-full h-48 bg-[#FF2A85] flex items-center justify-center relative overflow-hidden bg-halftone-cyan border-b-3 border-black">
          <svg class="w-32 h-32 text-[#FFE600] transition-transform duration-300 group-hover:scale-110" viewBox="0 0 100 100" fill="currentColor">
            <path stroke="#000" stroke-width="3.5" d="M85 15 Q40 10 20 50 Q10 70 30 85 Q45 80 50 65 Q60 40 85 20 Z"/>
            <path d="M85 15 Q65 30 50 65" stroke="#7A5C00" stroke-width="2.5" fill="none"/>
            <circle cx="35" cy="65" r="4" fill="#000"/>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">VINYL ART</span>
        </div>
      `;
    case 'zine':
      return `
        <div class="w-full h-48 bg-[#10FFA0] flex items-center justify-center relative overflow-hidden bg-comic-checker border-b-3 border-black">
          <svg class="w-28 h-32 text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 80 100" fill="currentColor">
            <rect x="15" y="10" width="55" height="80" fill="#FFF" stroke="#000" stroke-width="3"/>
            <rect x="22" y="20" width="41" height="25" fill="#FF5E00" stroke="#000" stroke-width="2"/>
            <line x1="22" y1="55" x2="63" y2="55" stroke="#000" stroke-width="3"/>
            <line x1="22" y1="65" x2="55" y2="65" stroke="#000" stroke-width="2"/>
            <line x1="22" y1="75" x2="45" y2="75" stroke="#000" stroke-width="2"/>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">84 PÁGINAS</span>
        </div>
      `;
    case 'glasses':
      return `
        <div class="w-full h-48 bg-[#FF5E00] flex items-center justify-center relative overflow-hidden bg-halftone-yellow border-b-3 border-black">
          <svg class="w-36 h-28 text-black transition-transform duration-300 group-hover:scale-110" viewBox="0 0 100 60" fill="currentColor">
            <rect x="10" y="15" width="35" height="30" rx="4" fill="#00F0FF" stroke="#000" stroke-width="3.5"/>
            <rect x="55" y="15" width="35" height="30" rx="4" fill="#00F0FF" stroke="#000" stroke-width="3.5"/>
            <line x1="45" y1="28" x2="55" y2="28" stroke="#000" stroke-width="4"/>
            <line x1="10" y1="20" x2="2" y2="15" stroke="#000" stroke-width="3"/>
            <line x1="90" y1="20" x2="98" y2="15" stroke="#000" stroke-width="3"/>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">ACETATO RETRO</span>
        </div>
      `;
    case 'soup':
      return `
        <div class="w-full h-48 bg-[#7928CA] flex items-center justify-center relative overflow-hidden bg-stripes-yellow border-b-3 border-black">
          <svg class="w-28 h-36 text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 70 100" fill="currentColor">
            <rect x="15" y="20" width="40" height="65" rx="5" fill="#FFF" stroke="#000" stroke-width="3"/>
            <rect x="15" y="20" width="40" height="30" fill="#FF1A75" stroke="#000" stroke-width="2"/>
            <ellipse cx="35" cy="20" rx="20" ry="7" fill="#CCC" stroke="#000" stroke-width="2.5"/>
            <circle cx="35" cy="55" r="10" fill="#FFE600" stroke="#000" stroke-width="2"/>
            <text x="35" y="58" font-size="8" font-weight="900" fill="#000" text-anchor="middle">SOUP</text>
          </svg>
          <span class="absolute bottom-2 right-2 text-xs font-black bg-black text-white px-2 py-0.5 border border-white">CANVAS ESCULTÓRICO</span>
        </div>
      `;
    default:
      return '';
  }
}

function renderProductGrid(filter = 'all') {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const filtered = filter === 'all' 
    ? state.products 
    : state.products.filter(p => p.category === filter);

  container.innerHTML = filtered.map(product => `
    <article class="group bg-white dark:bg-[#181824] border-3 border-black dark:border-white pop-shadow hover:pop-shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
      <!-- Top Badge -->
      <div class="absolute top-3 left-3 z-10">
        <span class="px-3 py-1 text-xs font-black tracking-wider uppercase border-2 border-black ${product.badgeColor} pop-shadow-sm inline-block">
          ${product.badge}
        </span>
      </div>

      <!-- Tag on right -->
      <div class="absolute top-3 right-3 z-10">
        <span class="px-2 py-0.5 text-[11px] font-bold bg-black text-white dark:bg-white dark:text-black">
          ${product.tag}
        </span>
      </div>

      <!-- Illustration Area -->
      ${getProductIllustration(product.icon)}

      <!-- Content Details -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 class="font-heading text-lg md:text-xl font-black leading-tight text-black dark:text-white group-hover:text-[#FF2A85] transition-colors">
            ${product.title}
          </h3>
          <p class="mt-2 text-xs md:text-sm text-gray-700 dark:text-gray-300 font-medium">
            ${product.subtitle}
          </p>
        </div>

        <div class="mt-5 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 line-through">$${product.originalPrice.toFixed(2)}</div>
            <div class="font-display text-2xl md:text-3xl text-black dark:text-[#FFE600]">$${product.price.toFixed(2)}</div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openQuickView('${product.id}')" aria-label="Ver detalles" class="pop-btn w-9 h-9 border-2 border-black bg-white dark:bg-gray-800 text-black dark:text-white flex items-center justify-center font-black pop-shadow-sm hover:bg-[#00F0FF] transition-colors">
              👁️
            </button>
            <button onclick="addToCart('${product.id}')" class="pop-btn px-4 py-2 border-2 border-black bg-[#FFE600] hover:bg-[#FF2A85] hover:text-white text-black font-black text-xs md:text-sm uppercase tracking-wider pop-shadow-sm transition-colors flex items-center gap-1.5">
              <span>+ BOLSA</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

// ====================================================================
// 6. CART MANAGEMENT & DRAWER
// ====================================================================
function initCart() {
  const openBtn = document.getElementById('open-cart-btn');
  const closeBtn = document.getElementById('close-cart-btn');
  const overlay = document.getElementById('cart-overlay');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  if (openBtn) openBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Tu bolsa está vacía. ¡Agrega piezas con actitud primero!');
        return;
      }
      closeCart();
      showToast('🎉 ¡Pedido Pop Simulado! Gracias por comprar arte auténtico.', 'cyan');
    });
  }

  updateCartUI();
}

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
  }
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
  }
}

function addToCart(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      category: product.category,
      qty: 1
    });
  }

  updateCartUI();
  showToast(`⚡ "${product.title}" añadido a la bolsa`, 'pink');
}

function updateCartQty(productId, change) {
  const itemIndex = state.cart.findIndex(i => i.id === productId);
  if (itemIndex > -1) {
    state.cart[itemIndex].qty += change;
    if (state.cart[itemIndex].qty <= 0) {
      state.cart.splice(itemIndex, 1);
    }
    updateCartUI();
  }
}

function removeCartItem(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  updateCartUI();
  showToast('Pieza removida de la bolsa');
}

function updateCartUI() {
  const badge = document.getElementById('cart-count-badge');
  const itemsContainer = document.getElementById('cart-items-list');
  const subtotalEl = document.getElementById('cart-subtotal');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');

  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) {
    badge.textContent = totalCount;
    badge.classList.remove('scale-125');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('scale-125');
    setTimeout(() => badge.classList.remove('scale-125'), 200);
  }

  if (!itemsContainer) return;

  if (state.cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="py-12 text-center">
        <div class="text-6xl mb-3 animate-pop-wiggle inline-block">🛍️</div>
        <p class="font-heading font-black text-xl text-black dark:text-white">TU BOLSA ESTÁ VACÍA</p>
        <p class="text-sm text-gray-500 mt-1">El arte pop te espera. Llena este espacio de color.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (shippingEl) shippingEl.textContent = '$0.00';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  itemsContainer.innerHTML = state.cart.map(item => `
    <div class="flex items-center gap-3 p-3 bg-white dark:bg-[#1E1E2E] border-2 border-black dark:border-white pop-shadow-sm">
      <div class="w-12 h-12 bg-[#FFE600] flex items-center justify-center font-display text-xl border-2 border-black flex-shrink-0">
        💥
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-xs md:text-sm text-black dark:text-white truncate">${item.title}</h4>
        <div class="text-xs text-gray-500 dark:text-gray-400 font-bold">$${item.price.toFixed(2)} c/u</div>
      </div>
      <div class="flex items-center border-2 border-black bg-yellow-100 dark:bg-gray-800">
        <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors">-</button>
        <span class="w-6 text-center text-xs font-black text-black dark:text-white">${item.qty}</span>
        <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center font-black hover:bg-black hover:text-white transition-colors">+</button>
      </div>
      <button onclick="removeCartItem('${item.id}')" class="text-xs text-red-500 hover:text-red-700 font-black px-1">✕</button>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// ====================================================================
// 7. QUICK VIEW MODAL
// ====================================================================
function openQuickView(productId) {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-modal');
  const modalContent = document.getElementById('quick-modal-body');
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border-3 border-black bg-[#FFE600] p-4 flex items-center justify-center relative overflow-hidden bg-halftone-pink">
        <div class="w-full flex items-center justify-center">
          ${getProductIllustration(product.icon)}
        </div>
      </div>
      <div class="flex flex-col justify-between">
        <div>
          <span class="px-3 py-1 text-xs font-black uppercase border-2 border-black ${product.badgeColor} inline-block mb-3">
            ${product.badge}
          </span>
          <h2 class="font-heading text-2xl md:text-3xl font-black text-black dark:text-white">${product.title}</h2>
          <p class="mt-3 text-sm text-gray-700 dark:text-gray-300">${product.subtitle}</p>
          
          <div class="mt-4 p-3 bg-yellow-50 dark:bg-gray-800 border-2 border-black">
            <span class="text-xs font-bold text-gray-500 uppercase">Detalles de Edición</span>
            <p class="text-xs font-black text-black dark:text-white mt-1">✓ ${product.tag}</p>
            <p class="text-xs font-black text-black dark:text-white">✓ Certificado de Autenticidad Incluido</p>
            <p class="text-xs font-black text-black dark:text-white">✓ Tintas resistentes UV a base de soja</p>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-400 line-through">$${product.originalPrice.toFixed(2)}</div>
            <div class="font-display text-4xl text-black dark:text-[#FFE600]">$${product.price.toFixed(2)}</div>
          </div>
          <button onclick="addToCart('${product.id}'); closeQuickView();" class="pop-btn px-6 py-3 border-3 border-black bg-[#FF2A85] text-white font-black text-sm uppercase tracking-wider pop-shadow hover:bg-black transition-colors">
            AÑADIR A LA BOLSA 🚀
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeQuickView() {
  const modal = document.getElementById('quick-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ====================================================================
// 8. NEWSLETTER & EXTRA INTERACTIONS
// ====================================================================
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletter-email');
      if (emailInput && emailInput.value) {
        showToast(`💥 ¡BOOM! ${emailInput.value} agregado a la lista secreta de drops VIP.`, 'pink');
        emailInput.value = '';
      }
    });
  }
}

// Window global exposes for HTML inline handlers
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.removeCartItem = removeCartItem;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.openCart = openCart;
window.closeCart = closeCart;
window.toggleTheme = toggleTheme;

// ====================================================================
// 9. DOM CONTENT LOADED EVENT
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initDiyStudio();
  initProducts();
  initCart();
  initNewsletter();

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeCart();
    }
  });

  // Modal backdrop click
  const modal = document.getElementById('quick-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeQuickView();
    });
  }
});
