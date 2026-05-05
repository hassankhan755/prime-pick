/* ==============================
   PRIME PICK – script.js
   ============================== */

// ── STORAGE HELPERS ──────────────────────────────────────────────
const STORAGE_KEY = 'primepick_products';

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || getDefaultProducts();
  } catch { return getDefaultProducts(); }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getDefaultProducts() {
  return [
    {
      id: 'default1',
      name: 'Smart LED Strip Lights – RGB Color Changing',
      price: '$12.99',
      link: '#',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      category: 'featured',
      desc: 'Transform any room with 5m of vibrant RGB LEDs. App-controlled, music sync, perfect for bedroom or gaming setup.'
    },
    {
      id: 'default2',
      name: 'Magnetic Phone Car Mount',
      price: '$8.49',
      link: '#',
      image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80',
      category: 'related',
      desc: 'Super strong magnet, 360° rotation, universal fit for all phones. One-handed operation.'
    },
    {
      id: 'default3',
      name: 'Portable Mini Projector',
      price: '$39.99',
      link: '#',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
      category: 'related',
      desc: '1080P support, built-in speaker, HDMI & USB. Perfect for movie nights anywhere.'
    },
    {
      id: 'default4',
      name: 'Wireless Charging Pad – 15W Fast Charge',
      price: '$14.99',
      link: '#',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80',
      category: 'related',
      desc: 'Compatible with iPhone & Android. Ultra-slim design with LED indicator. No more tangled cables.'
    },
    {
      id: 'default5',
      name: 'Stainless Steel Insulated Tumbler',
      price: '$11.99',
      link: '#',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
      category: 'related',
      desc: 'Keeps drinks cold 24hrs, hot 12hrs. BPA-free, leak-proof lid. Multiple colors available.'
    }
  ];
}

// ── ADMIN ──────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'primepick@755';
let adminUnlocked = false;
let adminTimerEl = null;
let adminHideTimeout = null;
let confirmCallback = null;
let keysPressed = new Set();

// Secret keyboard shortcut: Ctrl + Shift + A
document.addEventListener('keydown', (e) => {
  keysPressed.add(e.key.toLowerCase());
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    showAdminOverlay();
  }
});
document.addEventListener('keyup', (e) => keysPressed.delete(e.key.toLowerCase()));

function showAdminOverlay() {
  document.getElementById('adminOverlay').classList.remove('hidden');
  if (!adminUnlocked) {
    document.getElementById('adminLoginSection').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminPasswordInput').value = '';
    document.getElementById('adminError').classList.add('hidden');
  } else {
    renderAdminDashboard();
  }
}

function closeAdmin() {
  document.getElementById('adminOverlay').classList.add('hidden');
}

function checkAdminPassword() {
  const val = document.getElementById('adminPasswordInput').value;
  if (val === ADMIN_PASSWORD) {
    adminUnlocked = true;
    document.getElementById('adminLoginSection').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderAdminDashboard();
  } else {
    document.getElementById('adminError').classList.remove('hidden');
    document.getElementById('adminPasswordInput').value = '';
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !document.getElementById('adminLoginSection').classList.contains('hidden')) {
    checkAdminPassword();
  }
});

function renderAdminDashboard() {
  const products = getProducts();
  const list = document.getElementById('adminProductList');
  list.innerHTML = '';
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'admin-product-item';
    div.innerHTML = `
      <img src="${p.image || 'https://placehold.co/52x52/1a1a1a/gold?text=P'}" alt="${p.name}" onerror="this.src='https://placehold.co/52x52/252525/gold?text=IMG'"/>
      <div class="admin-item-info">
        <div class="admin-item-name">${p.name}</div>
        <div class="admin-item-price">${p.price}</div>
        <div class="admin-item-cat">${p.category === 'featured' ? '⭐ Featured' : '🔗 Related'}</div>
      </div>
      <div class="admin-item-actions">
        <button onclick="editProduct('${p.id}')">✏️ Edit</button>
        <button class="del-btn" onclick="deleteProduct('${p.id}')">🗑️ Del</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function saveProduct() {
  const id = document.getElementById('editProductId').value || 'prod_' + Date.now();
  const name = document.getElementById('prodName').value.trim();
  const price = document.getElementById('prodPrice').value.trim();
  const link = document.getElementById('prodLink').value.trim();
  const image = document.getElementById('prodImage').value.trim();
  const category = document.getElementById('prodCategory').value;
  const desc = document.getElementById('prodDesc').value.trim();

  if (!name || !price) { showToast('⚠️ Name and Price are required!'); return; }

  let products = getProducts();
  const existing = products.findIndex(p => p.id === id);
  const product = { id, name, price, link: link || '#', image, category, desc };

  if (existing >= 0) {
    products[existing] = product;
    showToast('✅ Product updated!');
  } else {
    products.push(product);
    showToast('✅ Product added!');
  }

  saveProducts(products);
  clearForm();
  renderAdminDashboard();
  renderPage();
}

function editProduct(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('editProductId').value = p.id;
  document.getElementById('prodName').value = p.name;
  document.getElementById('prodPrice').value = p.price;
  document.getElementById('prodLink').value = p.link;
  document.getElementById('prodImage').value = p.image;
  document.getElementById('prodCategory').value = p.category;
  document.getElementById('prodDesc').value = p.desc;
  document.getElementById('saveBtn').textContent = '💾 Update Product';
  document.getElementById('adminDashboard').scrollTop = 0;
}

function deleteProduct(id) {
  showConfirm('Delete this product?', () => {
    let products = getProducts().filter(p => p.id !== id);
    saveProducts(products);
    showToast('🗑️ Product deleted!');
    renderAdminDashboard();
    renderPage();
  });
}

function showConfirm(message, onConfirm) {
  const modal = document.getElementById('confirmModal');
  document.getElementById('confirmMessage').textContent = message;
  confirmCallback = onConfirm;
  modal.classList.remove('hidden');
}

function closeConfirm() {
  const modal = document.getElementById('confirmModal');
  modal.classList.add('hidden');
  confirmCallback = null;
}

function confirmYes() {
  if (typeof confirmCallback === 'function') confirmCallback();
  closeConfirm();
}

function confirmNo() {
  closeConfirm();
}

function clearForm() {
  document.getElementById('editProductId').value = '';
  document.getElementById('prodName').value = '';
  document.getElementById('prodPrice').value = '';
  document.getElementById('prodLink').value = '';
  document.getElementById('prodImage').value = '';
  document.getElementById('prodCategory').value = 'featured';
  document.getElementById('prodDesc').value = '';
  document.getElementById('saveBtn').textContent = '💾 Save Product';
}

// ── RENDER PAGE ────────────────────────────────────────────────────
function renderPage() {
  const products = getProducts();
  const featured = products.find(p => p.category === 'featured') || products[0];
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
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No related products yet. Add some via Admin Panel!</p></div>`;
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