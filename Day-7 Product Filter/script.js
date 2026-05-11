const CAT_META = {
    Electronics: { dot: "#8b85f9", color: "#8b85f9" },
    Fashion: { dot: "#f472b6", color: "#f472b6" },
    Kitchen: { dot: "#fb7185", color: "#fb7185" },
    Fitness: { dot: "#4ade80", color: "#4ade80" },
};

const PRODUCTS = [
    { id: 1, name: "Wireless Earbuds", cat: "Electronics", price: 1299, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&q=80", badge: "hot", rating: 4.5 },
    { id: 2, name: "Running Shoes", cat: "Fashion", price: 2499, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", badge: "new", rating: 4.3 },
    { id: 3, name: "Coffee Mug", cat: "Kitchen", price: 349, image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80", badge: null, rating: 4.7 },
    { id: 4, name: "Yoga Mat", cat: "Fitness", price: 799, image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=80", badge: "sale", rating: 4.4 },
    { id: 5, name: "Leather Backpack", cat: "Fashion", price: 1599, image: "https://www.shopmygear.com/cdn/shop/files/1_893b1272-47ce-466e-9aa7-0b24e2cc09b6.webp?v=1755081978&width=500", badge: "new", rating: 4.6 },
    { id: 6, name: "Smart Watch", cat: "Electronics", price: 4999, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80", badge: "hot", rating: 4.8 },
    { id: 7, name: "Blender Pro", cat: "Kitchen", price: 1199, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80", badge: "sale", rating: 4.2 },
    { id: 8, name: "Dumbbells Set", cat: "Fitness", price: 2199, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80", badge: null, rating: 4.5 },
    { id: 9, name: "Sunglasses", cat: "Fashion", price: 899, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", badge: null, rating: 4.1 },
    { id: 10, name: "Laptop Stand", cat: "Electronics", price: 1099, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80", badge: "new", rating: 4.6 },
    { id: 11, name: "Air Fryer", cat: "Kitchen", price: 3499, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80", badge: "hot", rating: 4.9 },
    { id: 12, name: "Resistance Bands", cat: "Fitness", price: 449, image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80", badge: "sale", rating: 4.3 },
];

const CATS = ["All", ...Object.keys(CAT_META)];
let activeCat = "All", searchQ = "", sortVal = "def";

function getLS(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function setLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }

let favs = getLS("sf_favs") || [];
let hist = getLS("sf_hist") || [];

function addHistory(q) {
    if (!q || q.length < 2) return;
    hist = hist.filter(h => h !== q);
    hist.unshift(q);
    if (hist.length > 6) hist = hist.slice(0, 6);
    setLS("sf_hist", hist);
    renderHistory();
}

function renderHistory() {
    const row = document.getElementById("histRow");
    const chips = document.getElementById("histChips");
    if (!hist.length) { row.style.display = "none"; return; }
    row.style.display = "flex";
    chips.innerHTML = hist.map(h => `<span class="hist-chip" onclick="applyHistory('${h}')">${h}</span>`).join("");
}

function applyHistory(q) {
    document.getElementById("searchInput").value = q;
    searchQ = q;
    document.getElementById("clearBtn").style.display = "flex";
    render();
}

function toggleFav(id) {
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    setLS("sf_favs", favs);
    render();
}

function getFilteredList() {
    let list = PRODUCTS;
    if (activeCat !== "All") list = list.filter(p => p.cat === activeCat);
    if (searchQ) {
        const q = searchQ.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    }
    if (sortVal === "pa") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortVal === "pd") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortVal === "az") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortVal === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortVal === "fav") list = [...list].sort((a, b) => favs.includes(b.id) - favs.includes(a.id));
    return list;
}

function renderCats() {
    document.getElementById("catRow").innerHTML = CATS.map(cat => {
        const dot = cat !== "All"
            ? `<span class="dot" style="background:${CAT_META[cat].dot}"></span>`
            : `<i class="ti ti-layout-grid" style="font-size:14px"></i>`;
        return `<button class="cat-btn${cat === activeCat ? " active" : ""}" onclick="setCat('${cat}')">${dot}${cat}</button>`;
    }).join("");
}

function setCat(cat) { activeCat = cat; render(); }

function renderStats(list) {
    const avg = list.length ? Math.round(list.reduce((s, p) => s + p.price, 0) / list.length) : 0;
    const fc = PRODUCTS.filter(p => favs.includes(p.id)).length;
    const topR = list.length ? Math.max(...list.map(p => p.rating)).toFixed(1) : "—";
    const stats = [
        { icon: "ti-package", bg: "rgba(139, 133, 249, 0.15)", col: "#8b85f9", val: list.length, lbl: "Products" },
        { icon: "ti-currency-rupee", bg: "rgba(34, 211, 238, 0.15)", col: "#22d3ee", val: "₹" + avg.toLocaleString("en-IN"), lbl: "Avg Price" },
        { icon: "ti-heart", bg: "rgba(244, 114, 182, 0.15)", col: "#f472b6", val: fc, lbl: "Saved" },
        { icon: "ti-star", bg: "rgba(251, 191, 36, 0.15)", col: "#fbbf24", val: topR, lbl: "Top Rating" },
    ];
    document.getElementById("statsGrid").innerHTML = stats.map(s =>
        `<div class="stat-card">
<div class="stat-icon" style="background:${s.bg};color:${s.col}"><i class="ti ${s.icon}"></i></div>
<div><div class="val" style="color:${s.col}">${s.val}</div><div class="lbl">${s.lbl}</div></div>
</div>`
    ).join("");
}

function badgeHTML(b) {
    if (!b) return "";
    const cls = { new: "badge-new", hot: "badge-hot", sale: "badge-sale" };
    const icon = { new: "ti-sparkles", hot: "ti-flame", sale: "ti-tag" };
    return `<div class="pcard-badge ${cls[b]}"><i class="ti ${icon[b]}"></i>${b.charAt(0).toUpperCase() + b.slice(1)}</div>`;
}

function imgHTML(p) {
    return `<img class="pcard-img" src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="pcard-emoji-fallback" style="display:none">🛍️</div>`;
}

function renderGrid(list) {
    const g = document.getElementById("grid");
    document.getElementById("countLabel").innerHTML = `<strong>${list.length}</strong> products found`;
    document.getElementById("navFavCount").textContent = favs.length;

    if (!list.length) {
        g.innerHTML = `<div class="empty">
<div class="empty-icon"><i class="ti ti-mood-empty"></i></div>
<p>No products found</p>
</div>`;
        return;
    }

    g.innerHTML = list.map(p => {
        const isFav = favs.includes(p.id);
        return `<div class="pcard${isFav ? " is-fav" : ""}">
${imgHTML(p)}
<div class="pcard-top">
<div class="pcard-fav-row">
  <button class="fav-btn${isFav ? " on" : ""}" onclick="toggleFav(${p.id})">
    <i class="ti ti-heart"></i>
  </button>
</div>
${badgeHTML(p.badge)}
<div class="pcard-name">${p.name}</div>
<div class="pcard-cat" style="color:${CAT_META[p.cat]?.color}">${p.cat}</div>
</div>
<div class="pcard-foot">
<span class="pcard-price">₹${p.price.toLocaleString("en-IN")}</span>
<span class="pcard-rating"><i class="ti ti-star-filled"></i>${p.rating}</span>
</div>
</div>`;
    }).join("");
}

function render() {
    renderCats();
    const list = getFilteredList();
    renderStats(list);
    renderGrid(list);
    renderHistory();
}

const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

searchInput.addEventListener("input", e => {
    searchQ = e.target.value;
    clearBtn.style.display = searchQ ? "flex" : "none";
    render();
});
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") addHistory(searchQ.trim()); });
clearBtn.addEventListener("click", () => { searchInput.value = ""; searchQ = ""; clearBtn.style.display = "none"; render(); });
document.getElementById("sortSel").addEventListener("change", e => { sortVal = e.target.value; render(); });

render();