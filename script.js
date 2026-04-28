import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const LOCAL_STORAGE_KEY = "primePickProducts";

const firebaseConfigured =
  !firebaseConfig.apiKey.includes("YOUR_") &&
  !firebaseConfig.projectId.includes("YOUR_") &&
  !firebaseConfig.authDomain.includes("YOUR_") &&
  !firebaseConfig.appId.includes("YOUR_");
let firestoreEnabled = firebaseConfigured;
let adminLoggedIn = false;
let editingProduct = null; // {index, id} for local or firestore

// ================= ADMIN PASSWORD =================
const ADMIN_PASSWORD = "PrimePick@2026";

// ================= DOM ELEMENTS =================
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const passInput = document.getElementById("pass");
const formBox = document.getElementById("formBox");
const msg = document.getElementById("msg");
const addBtn = document.getElementById("addBtn");
const productsContainer = document.getElementById("products");
const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const linkInput = document.getElementById("link");
const descInput = document.getElementById("desc");
const themeToggle = document.getElementById("themeToggle");
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
let pendingDeleteId = null;

function setStatus(text, color) {
  msg.textContent = text;
  msg.style.color = color;
}

function setTheme(theme) {
  document.body.classList.toggle("light-mode", theme === "light");
  document.body.classList.toggle("dark-mode", theme === "dark");
  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
  }
  localStorage.setItem("primePickTheme", theme);
}

const savedTheme = localStorage.getItem("primePickTheme") || "dark";
setTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

function getLocalProducts() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

function saveLocalProducts(products) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
}

async function updateProduct(editing, product) {
  if (firestoreEnabled) {
    try {
      await updateDoc(doc(db, "products", editing.id), product);
      return;
    } catch (err) {
      console.warn("Firestore update failed", err);
      firestoreEnabled = false;
    }
  }

  const saved = getLocalProducts();
  saved[editing.index] = product;
  saveLocalProducts(saved);
}

async function performDelete(id) {
  if (firestoreEnabled) {
    try {
      await deleteDoc(doc(db, "products", id));
      await loadProducts();
      return;
    } catch (err) {
      console.warn("Firestore delete failed", err);
      firestoreEnabled = false;
    }
  }

  const saved = getLocalProducts();
  saved.splice(Number(id), 1);
  saveLocalProducts(saved);
  await loadProducts();
}

function confirmDelete(id) {
  pendingDeleteId = id;
  confirmMessage.textContent = "Are you sure you want to permanently delete this product?";
  confirmModal.classList.remove("hidden");
}

function closeConfirmation() {
  pendingDeleteId = null;
  confirmModal.classList.add("hidden");
}

confirmYes.addEventListener("click", async () => {
  if (pendingDeleteId === null) return;
  await performDelete(pendingDeleteId);
  closeConfirmation();
});

confirmNo.addEventListener("click", () => {
  closeConfirmation();
});

function editProduct(id, products) {
  const product = products.find(p => (p.id || p.index) == id);
  if (!product) return;

  titleInput.value = product.title;
  priceInput.value = product.price;
  imageInput.value = product.image;
  linkInput.value = product.link;
  descInput.value = product.desc;

  editingProduct = firestoreEnabled ? { id } : { index: id };
  addBtn.textContent = "Update Product";
}

function renderProducts(products) {
  if (!products.length) {
    productsContainer.innerHTML =
      "<p class='empty-message'>No products available yet.</p>";
    return;
  }

  productsContainer.innerHTML = products
    .map(p => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}" />
        <h2>${p.title}</h2>
        <p>${p.desc}</p>
        <h3>Rs. ${p.price}</h3>
        <a class="btn" href="${p.link}" target="_blank">Order Now</a>
        ${adminLoggedIn ? `
          <button class="edit-btn" data-id="${p.id || p.index}">Edit</button>
          <button class="delete-btn" data-id="${p.id || p.index}">Delete</button>
        ` : ''}
      </div>
    `)
    .join("");

  // Add event listeners for edit and delete
  if (adminLoggedIn) {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => editProduct(e.target.dataset.id, products));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => confirmDelete(e.target.dataset.id));
    });
  }
}

async function loadProducts() {
  let products = [];

  if (firestoreEnabled) {
    try {
      const snap = await getDocs(collection(db, "products"));
      snap.forEach(doc => products.push({ ...doc.data(), id: doc.id }));
    } catch (err) {
      console.warn("Firestore load failed, falling back to localStorage", err);
      firestoreEnabled = false;
    }
  }

  if (!firestoreEnabled) {
    products = getLocalProducts().map((p, index) => ({ ...p, index }));
  }

  renderProducts(products);
}

async function saveProduct(product) {
  if (firestoreEnabled) {
    try {
      await addDoc(collection(db, "products"), product);
      return;
    } catch (err) {
      console.warn("Firestore add failed, using localStorage", err);
      firestoreEnabled = false;
    }
  }

  const saved = getLocalProducts();
  saved.push(product);
  saveLocalProducts(saved);
}

// ================= ADMIN TOGGLE =================
adminBtn.addEventListener("click", () => {
  adminPanel.classList.toggle("hidden");
});

// ================= LOGIN CHECK =================
passInput.addEventListener("input", () => {
  if (passInput.value === ADMIN_PASSWORD) {
    formBox.classList.remove("hidden");
    adminLoggedIn = true;
    setStatus("Access Granted", "lightgreen");
    loadProducts(); // Re-render to show edit/delete buttons
  } else {
    formBox.classList.add("hidden");
    adminLoggedIn = false;
    setStatus("Wrong Password", "red");
    loadProducts(); // Re-render to hide buttons
  }
});

// ================= ADD/UPDATE PRODUCT =================
addBtn.addEventListener("click", async () => {
  if (formBox.classList.contains("hidden")) {
    setStatus("Enter admin password first.", "orange");
    return;
  }

  const product = {
    title: titleInput.value.trim(),
    price: priceInput.value.trim(),
    image: imageInput.value.trim(),
    link: linkInput.value.trim(),
    desc: descInput.value.trim()
  };

  if (!product.title || !product.price || !product.image || !product.link) {
    setStatus("Please fill all required fields.", "orange");
    return;
  }

  if (Number.isNaN(Number(product.price)) || Number(product.price) < 0) {
    setStatus("Price must be a valid positive number.", "orange");
    return;
  }

  try {
    if (editingProduct) {
      await updateProduct(editingProduct, product);
      setStatus("Product updated successfully.", "lightgreen");
    } else {
      await saveProduct(product);
      setStatus(
        firestoreEnabled
          ? "Product added successfully."
          : "Product saved locally. Configure Firebase to persist online.",
        "lightgreen"
      );
    }

    titleInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    linkInput.value = "";
    descInput.value = "";
    editingProduct = null;
    addBtn.textContent = "Add Product";

    await loadProducts();
  } catch (err) {
    console.error("ADD/UPDATE PRODUCT ERROR:", err);
    setStatus("Failed to save product (check console)", "red");
  }
});

// ================= INIT =================
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    adminBtn.style.display = 'block';
    setTimeout(() => adminBtn.style.display = 'none', 10000); // Hide after 10 seconds
  }
});

loadProducts();
