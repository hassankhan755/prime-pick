import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
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

function setStatus(text, color) {
  msg.textContent = text;
  msg.style.color = color;
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

function renderProducts(products) {
  if (!products.length) {
    productsContainer.innerHTML =
      "<p style='color:#cbd5e1'>No products available yet.</p>";
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
      </div>
    `)
    .join("");
}

async function loadProducts() {
  let products = [];

  if (firestoreEnabled) {
    try {
      const snap = await getDocs(collection(db, "products"));
      snap.forEach(doc => products.push(doc.data()));
    } catch (err) {
      console.warn("Firestore load failed, falling back to localStorage", err);
      firestoreEnabled = false;
    }
  }

  if (!firestoreEnabled) {
    products = getLocalProducts();
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
    setStatus("Access Granted", "lightgreen");
  } else {
    formBox.classList.add("hidden");
    setStatus("Wrong Password", "red");
  }
});

// ================= ADD PRODUCT =================
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
    await saveProduct(product);

    setStatus(
      firestoreEnabled
        ? "Product added successfully."
        : "Product saved locally. Configure Firebase to persist online.",
      "lightgreen"
    );

    titleInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    linkInput.value = "";
    descInput.value = "";

    await loadProducts();
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    setStatus("Failed to add product (check console)", "red");
  }
});

// ================= INIT =================
loadProducts();
