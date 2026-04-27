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

// ================= ADMIN PASSWORD =================
const ADMIN_PASSWORD = "PrimePick@2026";

// ================= DOM ELEMENTS =================
const adminBtn = document.getElementById("adminBtn");
const adminPanel = document.getElementById("adminPanel");
const passInput = document.getElementById("pass");
const formBox = document.getElementById("formBox");
const msg = document.getElementById("msg");
const addbtn = document.getElementById("addBtn")
addBtn.onclick = console.log(" click detected")

// ================= ADMIN TOGGLE =================
adminBtn.onclick = () => {
  adminPanel.classList.toggle("hidden");
};

// ================= LOGIN CHECK =================
passInput.addEventListener("input", () => {
  if (passInput.value === ADMIN_PASSWORD) {
    formBox.classList.remove("hidden");
    msg.textContent = "Access Granted";
    msg.style.color = "lightgreen";
  } else {
    formBox.classList.add("hidden");
    msg.textContent = "Wrong Password";
    msg.style.color = "red";
  }
});

// ================= LOAD PRODUCTS =================
async function loadProducts() {
  try {
    const snap = await getDocs(collection(db, "products"));

    let html = "";

    snap.forEach(doc => {
      const p = doc.data();

      html += `
        <div class="card">
          <img src="${p.image}" />
          <h2>${p.title}</h2>
          <p>${p.desc}</p>
          <h3>Rs. ${p.price}</h3>
          <a class="btn" href="${p.link}" target="_blank">Order Now</a>
        </div>
      `;
    });

    document.getElementById("products").innerHTML = html;

  } catch (err) {
    console.error("LOAD ERROR:", err);
    document.getElementById("products").innerHTML =
      "<p style='color:red'>Failed to load products (check Firebase)</p>";
  }
}

// ================= ADD PRODUCT (DEBUG FIXED) =================
document.getElementById("addBtn").onclick = async () => {
  try {
    const product = {
      title: document.getElementById("title").value,
      price: document.getElementById("price").value,
      image: document.getElementById("image").value,
      link: document.getElementById("link").value,
      desc: document.getElementById("desc").value
    };

    console.log("Adding product:", product);

    if (!product.title || !product.price || !product.image || !product.link) {
      msg.textContent = "Please fill all required fields";
      msg.style.color = "orange";
      return;
    }

    await addDoc(collection(db, "products"), product);

    msg.textContent = "Product added successfully";
    msg.style.color = "lightgreen";

    // clear fields
    document.getElementById("title").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
    document.getElementById("link").value = "";
    document.getElementById("desc").value = "";

    loadProducts();

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    msg.textContent = "Failed to add product (check console)";
    msg.style.color = "red";
  }
};

// ================= INIT =================
loadProducts();