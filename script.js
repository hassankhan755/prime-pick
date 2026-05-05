/* ==============================
   PRIME PICK – script.js
   ============================== */

window.PRODUCTS = [
  {
    id: 'prod1',
    name: 'Smart LED Strip Lights – RGB Color Changing',
    price: '$12.99',
    link: '#',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    category: 'featured',
    desc: 'Transform any room with RGB lighting.'
  },
  {
    id: 'prod2',
    name: 'Magnetic Phone Car Mount',
    price: '$8.49',
    link: '#',
    image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80',
    category: 'related',
    desc: 'Strong grip, 360° rotation.'
  },
  {
  id: 'prod3',
  name: 'Ear Buds',
  price: '$54.78',
  link: 'https://s.click.aliexpress.com/e/_c4oaf6ZN',
  image: 'https://ae-pic-a1.aliexpress-media.com/kf/S7ee3c36cf21b4010994522ce0f2f6c38z.jpg',
  category: 'related', // or 'featured'
  desc: 'very nice earbuds'
}
];

// ── STORAGE HELPERS ──────────────────────────────────────────────
const STORAGE_KEY = 'primepick_products';

function getProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const defaults = getDefaultProducts();

    if (!Array.isArray(stored) || stored.length === 0) {
      return defaults;
    }

    const ids = new Set(defaults.map(p => p.id));
    const merged = defaults.slice();
    stored.forEach(item => {
      if (!ids.has(item.id)) {
        merged.push(item);
      }
    });

    return merged;
  } catch {
    return getDefaultProducts();
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getDefaultProducts() {
  return window.PRODUCTS || [];
}

// ── RENDER PAGE ────────────────────────────────────────────────────
function renderPage() {
  const products = getProducts();
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('product');

  let featured = productId
    ? products.find(p => p.id === productId)
    : products.find(p => p.category === 'featured');

  if (!featured) {
    featured = products.find(p => p.category === 'featured') || products[0];
  }

  const related = products.filter(p => p.category === 'related');

  // Hero
  if (featured) {
    document.getElementById('heroImg').src = featured.image || 'https://placehold.co/600x420/1a1a1a/gold?text=Product';
    document.getElementById('heroImg').onerror = function() {
      this.src = 'https://placehold.co/600x420/252525/gold?text=Image+Not+Found';
    };
    document.getElementById('heroName').textContent = featured.name;
    document.getElementById('heroDesc').textContent = featured.desc;
    document.getElementById('heroPrice').textContent = featured.price;
    document.getElementById('heroBtn').href = featured.link !== '#' ? featured.link : '#';
  }

  // Related grid
  const grid = document.getElementById('relatedGrid');
  grid.innerHTML = '';
  if (related.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No related products available at the moment.</p></div>`;
    return;
  }
  related.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image || 'https://placehold.co/260x220/1a1a1a/gold?text=Product'}"
           alt="${p.name}"
           onerror="this.src='https://placehold.co/260x220/252525/gold?text=No+Image'"/>
      <div class="card-body">
        <div class="card-name">${p.name}</div>
        <div class="card-desc">${p.desc || ''}</div>
        <div class="card-price">${p.price}</div>
        <a href="${p.link !== '#' ? p.link : '#'}" target="_blank" class="card-btn">
          🛒 Buy Now
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', renderPage);