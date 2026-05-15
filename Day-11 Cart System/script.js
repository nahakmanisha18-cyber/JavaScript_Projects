const PRODUCTS = [
    {
        id: 1, name: "Artisan Coffee Blend", category: "food", price: 499,
        badge: "Popular", origPrice: 649,
        img: "https://m.media-amazon.com/images/I/81YP9ieTVGL._AC_UF350,350_QL80_.jpg"
    },
    {
        id: 2, name: "Dark Chocolate Box", category: "food", price: 349,
        badge: null, origPrice: null,
        img: "https://assets.winni.in/product/primary/2023/10/89925.jpeg?dpr=1&w=500"
    },
    {
        id: 3, name: "Matcha Green Tea Set", category: "food", price: 599,
        badge: "New", origPrice: 799,
        img: "https://m.media-amazon.com/images/I/61jmfyYcy9L._AC_UF894,1000_QL80_.jpg"
    },
    {
        id: 4, name: "Wireless Earbuds Pro", category: "tech", price: 2999,
        badge: "Hot", origPrice: 3999,
        img: "https://www.gadgetlane.co.in/cdn/shop/files/3rd_a13f22a3-deb8-46d2-97c2-902a990cb1b3.jpg?v=1772296407&width=1946"
    },
    {
        id: 5, name: "Mechanical Keyboard", category: "tech", price: 4499,
        badge: null, origPrice: null,
        img: "https://images.unsplash.com/photo-1561112078-7d24e04c3407?w=400&q=80"
    },
    {
        id: 6, name: "Smart Watch Ultra", category: "tech", price: 8999,
        badge: "Best", origPrice: 11999,
        img: "https://guggu.in/wp-content/uploads/2025/05/t900-smart-watch-1-600x600.png"
    },
    {
        id: 7, name: "T shirt", category: "fashion", price: 1299,
        badge: null, origPrice: null,
        img: "https://devhero.in/cdn/shop/files/2_ee2ac170-29c1-464b-8953-929bfcec2416.png?v=1758358121&width=533"
    },
    {
        id: 8, name: "Canvas Sneakers", category: "fashion", price: 2199,
        badge: "Trending", origPrice: 2699,
        img: "https://m.media-amazon.com/images/I/814+Gb1oPQL._AC_UY1000_.jpg"
    },
    {
        id: 9, name: "Leather Wallet", category: "fashion", price: 899,
        badge: null, origPrice: null,
        img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80"
    },
    {
        id: 10, name: "Linen Cushion Set", category: "home", price: 799,
        badge: null, origPrice: null,
        img: "https://m.media-amazon.com/images/I/61-PtdpkBjL._AC_UF894,1000_QL80_.jpg"
    },
    {
        id: 11, name: "Aroma Diffuser", category: "home", price: 1199,
        badge: "New", origPrice: 1499,
        img: "https://m.media-amazon.com/images/I/81Dif08RrAL._AC_UF894,1000_QL80_.jpg"
    },
    {
        id: 12, name: "Ceramic Mug Set", category: "home", price: 699,
        badge: null, origPrice: null,
        img: "https://kaunteya.in/cdn/shop/products/20210925_123126-e1632908817170.jpg?v=1687169726"
    },
];

let cart = {}, promoApplied = false;

function renderProducts(filter = 'all') {
    const grid = document.getElementById('productGrid');
    const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
    grid.innerHTML = list.map(p => `
    <div class="product-card ${cart[p.id] ? 'in-cart' : ''}" id="pcard-${p.id}">
      <div class="product-image">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onload="this.parentElement.classList.add('loaded')">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <span class="in-cart-overlay">✓ In Cart</span>
        <button class="quick-add" onclick="addToCart(${p.id})">+ Add to Cart</button>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-category">${p.category}</div>
        <div class="product-footer">
          <div class="price-wrap">
            <div class="product-price">₹${p.price.toLocaleString()}</div>
            ${p.origPrice ? `<div class="product-price-orig">₹${p.origPrice.toLocaleString()}</div>` : ''}
          </div>
          <button class="add-btn" onclick="addToCart(${p.id})" title="Add to cart">+</button>
        </div>
      </div>
    </div>`).join('');
}

function addToCart(id) {
    const p = PRODUCTS.find(x => x.id === id);
    cart[id] = cart[id] ? { ...cart[id], qty: cart[id].qty + 1 } : { ...p, qty: 1 };
    document.getElementById('pcard-' + id)?.classList.add('in-cart');
    renderCart();
    bumpBadge();
    showToast(p.name + ' added to cart');
}

function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) {
        delete cart[id];
        document.getElementById('pcard-' + id)?.classList.remove('in-cart');
    }
    renderCart();
}

function removeItem(id) {
    delete cart[id];
    document.getElementById('pcard-' + id)?.classList.remove('in-cart');
    renderCart();
    showToast('Item removed from cart');
}

function renderCart() {
    const items = Object.values(cart);
    const container = document.getElementById('cartItemsContainer');
    const footer = document.getElementById('cartFooter');
    const badge = document.getElementById('badgeCount');
    const countText = document.getElementById('cartCountText');
    const fillBar = document.getElementById('progressFill');
    const progLabel = document.getElementById('progressLabel');

    const totalQty = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    badge.textContent = totalQty;

    // free shipping progress
    const FREE_AT = 3000;
    const pct = Math.min((subtotal / FREE_AT) * 100, 100);
    fillBar.style.width = pct + '%';
    progLabel.textContent = subtotal >= FREE_AT
        ? '🎉 You unlocked free shipping!'
        : `Add ₹${(FREE_AT - subtotal).toLocaleString()} more for free shipping`;

    if (!items.length) {
        container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-ring">🛒</div>
        <div class="empty-text">Your cart is empty</div>
        <div class="empty-sub">Add items from the collection</div>
      </div>`;
        footer.style.display = 'none';
        countText.textContent = '0 items';
        return;
    }

    countText.textContent = totalQty + ' item' + (totalQty !== 1 ? 's' : '');
    footer.style.display = 'block';

    container.innerHTML = items.map(item => `
    <div class="cart-item">
      <img class="item-thumb" src="${item.img}" alt="${item.name}" loading="lazy">
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-unit-price">₹${item.price.toLocaleString()} each</div>
        <div class="item-controls">
          <button class="qty-btn minus" onclick="changeQty(${item.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
      <div class="item-right">
        <span class="item-subtotal">₹${(item.price * item.qty).toLocaleString()}</span>
        <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove">✕</button>
      </div>
    </div>`).join('');

    const shipping = subtotal >= FREE_AT ? 0 : 99;
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + shipping - discount;

    document.getElementById('subtotalVal').textContent = '₹' + subtotal.toLocaleString();
    document.getElementById('shippingVal').textContent = shipping === 0 ? 'FREE 🎁' : '₹' + shipping;
    document.getElementById('discountRow').style.display = promoApplied ? 'flex' : 'none';
    document.getElementById('discountVal').textContent = '−₹' + discount.toLocaleString();
    document.getElementById('totalVal').textContent = '₹' + total.toLocaleString();
}

function applyPromo() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (code === 'SAVE10') {
        promoApplied = true; renderCart();
        showToast('🎉 Promo applied! 10% off');
        document.getElementById('promoInput').value = '';
        document.getElementById('promoInput').placeholder = 'SAVE10 applied ✓';
    } else if (code) {
        showToast('Invalid promo code');
    }
}

function clearCart() {
    cart = {}; promoApplied = false;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('in-cart'));
    renderCart(); showToast('Cart cleared');
}

function checkout() {
    if (!Object.keys(cart).length) return;
    const id = '#SL-' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('orderId').textContent = id;
    document.getElementById('modalOverlay').classList.add('show');
    cart = {}; promoApplied = false;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('in-cart'));
    renderCart();
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('show'); }

function filterProducts(filter, btn) {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(filter);
}

function scrollToCart() { document.getElementById('cartPanel').scrollIntoView({ behavior: 'smooth' }); }

function bumpBadge() {
    const b = document.getElementById('badgeCount');
    b.classList.add('bump');
    setTimeout(() => b.classList.remove('bump'), 350);
}

let toastTimer;
function showToast(msg) {
    clearTimeout(toastTimer);
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

renderProducts();
renderCart();
