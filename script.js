'use strict';

/* =========================================================
   MENU DATA
   Each item: id, name, category, description, price, rating, icon
   Icons are emoji used as self-contained, dependency-free visuals.
   ========================================================= */
const MENU = [
  // Pizza
  { id: 1,  name: 'Margherita Classic',        category: 'Pizza',    description: 'Wood-fired base, San Marzano tomato sauce, fresh mozzarella and basil.', price: 249, rating: 4.5, icon: '🍕' },
  { id: 2,  name: 'Farmhouse Veggie Delight',   category: 'Pizza',    description: 'Loaded with bell peppers, onions, mushroom, corn and olives.', price: 299, rating: 4.3, icon: '🍕' },
  { id: 3,  name: 'Pepperoni Blaze',            category: 'Pizza',    description: 'Double pepperoni, mozzarella and a spicy chilli-oil drizzle.', price: 329, rating: 4.6, icon: '🍕' },

  // Burgers
  { id: 4,  name: 'Classic Veggie Burger',      category: 'Burgers',  description: 'Crisp potato-corn patty, lettuce, tomato and house mayo in a soft bun.', price: 149, rating: 4.2, icon: '🍔' },
  { id: 5,  name: 'Smoky BBQ Chicken Burger',    category: 'Burgers',  description: 'Grilled chicken patty, smoky BBQ sauce, caramelised onions and cheese.', price: 189, rating: 4.5, icon: '🍔' },
  { id: 6,  name: 'Double Cheese Stack',        category: 'Burgers',  description: 'Two beef patties, double cheddar, pickles and burger sauce.', price: 219, rating: 4.4, icon: '🍔' },

  // Indian
  { id: 7,  name: 'Butter Chicken',             category: 'Indian',   description: 'Tandoori chicken simmered in a rich tomato-butter gravy, served with rice.', price: 259, rating: 4.7, icon: '🍛' },
  { id: 8,  name: 'Paneer Tikka Masala',        category: 'Indian',   description: 'Chargrilled paneer cubes in a spiced onion-tomato masala.', price: 229, rating: 4.6, icon: '🍛' },
  { id: 9,  name: 'Masala Dosa',                category: 'Indian',   description: 'Crisp fermented rice crepe filled with spiced potato masala, served with chutney and sambar.', price: 129, rating: 4.4, icon: '🌯' },

  // Chinese
  { id: 10, name: 'Veg Hakka Noodles',          category: 'Chinese',  description: 'Wok-tossed noodles with julienned vegetables in a soy-garlic sauce.', price: 179, rating: 4.3, icon: '🍜' },
  { id: 11, name: 'Chilli Paneer',              category: 'Chinese',  description: 'Crispy paneer tossed with peppers, onions and a tangy chilli sauce.', price: 199, rating: 4.5, icon: '🥡' },
  { id: 12, name: 'Chicken Manchurian',         category: 'Chinese',  description: 'Fried chicken bites in a bold garlic-soy Manchurian gravy.', price: 219, rating: 4.6, icon: '🥡' },

  // Desserts
  { id: 13, name: 'Chocolate Lava Cake',        category: 'Desserts', description: 'Warm chocolate cake with a molten centre, served with vanilla ice cream.', price: 129, rating: 4.8, icon: '🍫' },
  { id: 14, name: 'Gulab Jamun (4 pcs)',        category: 'Desserts', description: 'Soft milk-solid dumplings soaked in rose-cardamom sugar syrup.', price: 99,  rating: 4.5, icon: '🍮' },
  { id: 15, name: 'Belgian Waffle Sundae',      category: 'Desserts', description: 'Crisp waffle topped with ice cream, chocolate sauce and nuts.', price: 159, rating: 4.6, icon: '🧇' },

  // Drinks
  { id: 16, name: 'Cold Coffee Frappe',         category: 'Drinks',   description: 'Blended cold coffee with milk, ice and a whipped cream top.', price: 99, rating: 4.4, icon: '☕' },
  { id: 17, name: 'Fresh Lime Soda',            category: 'Drinks',   description: 'Sweet, salted or plain — freshly squeezed lime with chilled soda.', price: 59, rating: 4.2, icon: '🥤' },
  { id: 18, name: 'Mango Lassi',                category: 'Drinks',   description: 'Thick yoghurt smoothie blended with ripe Alphonso mango.', price: 89, rating: 4.7, icon: '🥭' },
];

const CATEGORIES = ['All', 'Pizza', 'Burgers', 'Indian', 'Chinese', 'Desserts', 'Drinks'];

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;
const COUPON_CODE = 'CRAVE10';
const COUPON_RATE = 0.10;

const STORAGE_CART = 'cravebite_cart_v1';
const STORAGE_COUPON = 'cravebite_coupon_v1';

/* =========================================================
   STATE
   ========================================================= */
const state = {
  cart: [],              // [{ id, qty }]
  couponApplied: false,
  activeCategory: 'All',
  searchTerm: '',
  detailsItemId: null,
  detailsQty: 1,
  lastOrder: null,
};

/* =========================================================
   PERSISTENCE
   ========================================================= */
function saveCart() {
  try {
    localStorage.setItem(STORAGE_CART, JSON.stringify(state.cart));
    localStorage.setItem(STORAGE_COUPON, JSON.stringify(state.couponApplied));
  } catch (e) {
    // localStorage may be unavailable (private browsing, quota) — fail silently
    console.warn('Could not save cart to localStorage', e);
  }
}

function loadCart() {
  try {
    const rawCart = localStorage.getItem(STORAGE_CART);
    const rawCoupon = localStorage.getItem(STORAGE_COUPON);
    if (rawCart) {
      const parsed = JSON.parse(rawCart);
      if (Array.isArray(parsed)) {
        state.cart = parsed.filter(entry =>
          entry && typeof entry.id === 'number' && typeof entry.qty === 'number' &&
          MENU.some(m => m.id === entry.id) && entry.qty >= 1
        );
      }
    }
    if (rawCoupon) {
      state.couponApplied = JSON.parse(rawCoupon) === true;
    }
  } catch (e) {
    console.warn('Could not load cart from localStorage', e);
    state.cart = [];
    state.couponApplied = false;
  }
}

/* =========================================================
   HELPERS
   ========================================================= */
function formatMoney(amount) {
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}

function findMenuItem(id) {
  return MENU.find(item => item.id === id);
}

function getCartLines() {
  return state.cart
    .map(entry => {
      const item = findMenuItem(entry.id);
      if (!item) return null;
      return { ...item, qty: entry.qty, lineTotal: item.price * entry.qty };
    })
    .filter(Boolean);
}

function getCartCount() {
  return state.cart.reduce((sum, e) => sum + e.qty, 0);
}

function getSubtotal() {
  return getCartLines().reduce((sum, line) => sum + line.lineTotal, 0);
}

function calcTotals() {
  const subtotal = getSubtotal();
  const discount = state.couponApplied ? subtotal * COUPON_RATE : 0;
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const taxableAmount = subtotal - discount;
  const tax = subtotal > 0 ? taxableAmount * TAX_RATE : 0;
  const total = taxableAmount + delivery + tax;
  return { subtotal, discount, delivery, tax, total };
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* =========================================================
   NAVIGATION
   ========================================================= */
function showView(name) {
  // Guard: checkout requires a non-empty cart
  if (name === 'checkout' && getCartCount() === 0) {
    showToast('Your cart is empty — add something first.');
    name = 'cart';
  }

  document.querySelectorAll('.view').forEach(section => {
    section.hidden = section.dataset.view !== name;
  });

  document.querySelectorAll('.nav-link').forEach(btn => {
    const target = btn.dataset.nav;
    btn.classList.toggle('is-active', target === name || (name === 'checkout' && target === 'cart') || (name === 'confirm' && target === 'cart'));
  });

  if (name === 'cart') renderCart();
  if (name === 'checkout') renderCheckoutSummary();

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* =========================================================
   RENDER: CATEGORY BAR
   ========================================================= */
function renderCategories() {
  const bar = document.getElementById('categoryBar');
  bar.innerHTML = CATEGORIES.map(cat => `
    <button type="button" class="category-chip${cat === state.activeCategory ? ' is-active' : ''}" data-category="${cat}">
      ${categoryEmoji(cat)} ${cat}
    </button>
  `).join('');

  bar.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.activeCategory = chip.dataset.category;
      renderCategories();
      renderMenu();
    });
  });
}

function categoryEmoji(cat) {
  const map = { All: '🍽️', Pizza: '🍕', Burgers: '🍔', Indian: '🍛', Chinese: '🥡', Desserts: '🍰', Drinks: '🥤' };
  return map[cat] || '';
}

/* =========================================================
   RENDER: FOOD GRID
   ========================================================= */
function getFilteredMenu() {
  const term = state.searchTerm.trim().toLowerCase();
  return MENU.filter(item => {
    const matchesCategory = state.activeCategory === 'All' || item.category === state.activeCategory;
    const matchesSearch = !term
      || item.name.toLowerCase().includes(term)
      || item.description.toLowerCase().includes(term)
      || item.category.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}

function renderMenu() {
  const grid = document.getElementById('foodGrid');
  const noResults = document.getElementById('noResults');
  const heading = document.getElementById('menuHeading');
  const count = document.getElementById('menuCount');

  const items = getFilteredMenu();

  heading.textContent = state.activeCategory === 'All' ? 'All dishes' : state.activeCategory;
  count.textContent = items.length ? `${items.length} item${items.length === 1 ? '' : 's'}` : '';

  if (items.length === 0) {
    grid.innerHTML = '';
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;

  grid.innerHTML = items.map(item => `
    <article class="food-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View details for ${escapeHtml(item.name)}">
      <div class="food-visual" data-catcolor="${item.category}">${item.icon}</div>
      <div class="food-body">
        <span class="food-cat-tag">${item.category}</span>
        <h3 class="food-name">${escapeHtml(item.name)}</h3>
        <p class="food-desc">${escapeHtml(item.description)}</p>
        <div class="food-meta">
          <span class="food-rating">★ ${item.rating.toFixed(1)} <span>rating</span></span>
          <span class="food-price">${formatMoney(item.price)}</span>
        </div>
        <button type="button" class="food-add-btn" data-quick-add="${item.id}">Add to cart</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.food-card').forEach(card => {
    const id = Number(card.dataset.id);
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-quick-add]')) return;
      openDetails(id);
    });
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-quick-add]')) {
        e.preventDefault();
        openDetails(id);
      }
    });
  });

  grid.querySelectorAll('[data-quick-add]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.quickAdd);
      addToCart(id, 1);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* =========================================================
   DETAILS MODAL
   ========================================================= */
function openDetails(id) {
  const item = findMenuItem(id);
  if (!item) return;

  state.detailsItemId = id;
  state.detailsQty = 1;

  document.getElementById('detailsVisual').textContent = item.icon;
  document.getElementById('detailsVisual').setAttribute('data-catcolor', item.category);
  document.getElementById('detailsCategory').textContent = item.category;
  document.getElementById('detailsName').textContent = item.name;
  document.getElementById('detailsRating').innerHTML = `★ ${item.rating.toFixed(1)} <span>rating</span>`;
  document.getElementById('detailsDesc').textContent = item.description;
  document.getElementById('detailsPrice').textContent = formatMoney(item.price);
  document.getElementById('detailsQtyValue').textContent = '1';

  document.getElementById('detailsOverlay').hidden = false;
  document.getElementById('detailsAddBtn').focus();
}

function closeDetails() {
  document.getElementById('detailsOverlay').hidden = true;
  state.detailsItemId = null;
}

function changeDetailsQty(delta) {
  state.detailsQty = Math.max(1, state.detailsQty + delta);
  document.getElementById('detailsQtyValue').textContent = String(state.detailsQty);
}

/* =========================================================
   CART OPERATIONS
   ========================================================= */
function addToCart(id, qty) {
  const item = findMenuItem(id);
  if (!item || qty < 1) return;

  const existing = state.cart.find(e => e.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ id, qty });
  }
  saveCart();
  updateCartBadge();
  showToast(`${item.name} added to cart`);
}

function updateCartQty(id, delta) {
  const entry = state.cart.find(e => e.id === id);
  if (!entry) return;
  entry.qty = Math.max(1, entry.qty + delta);
  saveCart();
  updateCartBadge();
  renderCart();
}

function removeFromCart(id) {
  const item = findMenuItem(id);
  state.cart = state.cart.filter(e => e.id !== id);
  if (state.cart.length === 0) state.couponApplied = false;
  saveCart();
  updateCartBadge();
  renderCart();
  if (item) showToast(`${item.name} removed`);
}

function updateCartBadge() {
  document.getElementById('cartBadge').textContent = String(getCartCount());
}

/* =========================================================
   RENDER: CART VIEW
   ========================================================= */
function renderCart() {
  const container = document.getElementById('cartItems');
  const emptyState = document.getElementById('cartEmpty');
  const layout = document.querySelector('.cart-layout');
  const lines = getCartLines();

  if (lines.length === 0) {
    container.innerHTML = '';
    layout.hidden = true;
    emptyState.hidden = false;
    renderSummary();
    return;
  }
  layout.hidden = false;
  emptyState.hidden = true;

  container.innerHTML = lines.map(line => `
    <div class="cart-item" data-id="${line.id}">
      <div class="cart-item-visual" data-catcolor="${line.category}">${line.icon}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${escapeHtml(line.name)}</p>
        <p class="cart-item-price">${formatMoney(line.price)} each</p>
      </div>
      <div class="cart-item-controls">
        <div class="qty-control">
          <button type="button" data-qty-minus="${line.id}" aria-label="Decrease quantity of ${escapeHtml(line.name)}" ${line.qty <= 1 ? 'disabled' : ''}>−</button>
          <span>${line.qty}</span>
          <button type="button" data-qty-plus="${line.id}" aria-label="Increase quantity of ${escapeHtml(line.name)}">+</button>
        </div>
        <span class="cart-item-subtotal">${formatMoney(line.lineTotal)}</span>
        <button type="button" class="remove-btn" data-remove="${line.id}" aria-label="Remove ${escapeHtml(line.name)} from cart">🗑</button>
      </div>
    </div>
  `).join('');

  renderSummary();
}

// Single delegated listener for all cart-item controls, bound once in initEvents().
// Using delegation (instead of re-binding per render) guarantees clicks always hit
// the current DOM and the cart re-renders immediately after every action.
function handleCartItemsClick(e) {
  const minusBtn = e.target.closest('[data-qty-minus]');
  const plusBtn = e.target.closest('[data-qty-plus]');
  const removeBtn = e.target.closest('[data-remove]');

  if (minusBtn) {
    updateCartQty(Number(minusBtn.dataset.qtyMinus), -1);
  } else if (plusBtn) {
    updateCartQty(Number(plusBtn.dataset.qtyPlus), 1);
  } else if (removeBtn) {
    removeFromCart(Number(removeBtn.dataset.remove));
  }
}

function renderSummary() {
  const { subtotal, discount, delivery, tax, total } = calcTotals();

  document.getElementById('sumSubtotal').textContent = formatMoney(subtotal);
  document.getElementById('sumDelivery').textContent = formatMoney(delivery);
  document.getElementById('sumTax').textContent = formatMoney(tax);
  document.getElementById('sumTotal').textContent = formatMoney(total);

  const discountRow = document.getElementById('discountRow');
  if (discount > 0) {
    discountRow.hidden = false;
    document.getElementById('sumDiscount').textContent = '−' + formatMoney(discount);
  } else {
    discountRow.hidden = true;
  }

  const couponInput = document.getElementById('couponInput');
  const applyBtn = document.getElementById('applyCouponBtn');
  const msg = document.getElementById('couponMsg');

  if (state.couponApplied) {
    couponInput.value = COUPON_CODE;
    couponInput.disabled = true;
    applyBtn.textContent = 'Applied ✓';
    applyBtn.disabled = true;
    msg.textContent = `Coupon applied — you saved ${formatMoney(discount)}.`;
    msg.className = 'coupon-msg success';
  } else {
    couponInput.disabled = false;
    applyBtn.textContent = 'Apply';
    applyBtn.disabled = false;
  }
}

function applyCoupon() {
  const msg = document.getElementById('couponMsg');
  const input = document.getElementById('couponInput');

  if (state.couponApplied) {
    msg.textContent = 'This coupon is already applied to your order.';
    msg.className = 'coupon-msg error';
    return;
  }

  const code = input.value.trim().toUpperCase();
  if (!code) {
    msg.textContent = 'Enter a coupon code first.';
    msg.className = 'coupon-msg error';
    return;
  }

  if (getCartCount() === 0) {
    msg.textContent = 'Add items to your cart before applying a coupon.';
    msg.className = 'coupon-msg error';
    return;
  }

  if (code === COUPON_CODE) {
    state.couponApplied = true;
    saveCart();
    renderSummary();
    showToast('Coupon CRAVE10 applied — 10% off!');
  } else {
    msg.textContent = 'That coupon code is invalid.';
    msg.className = 'coupon-msg error';
  }
}

/* =========================================================
   CHECKOUT
   ========================================================= */
function renderCheckoutSummary() {
  const lines = getCartLines();
  const { subtotal, discount, delivery, tax, total } = calcTotals();

  document.getElementById('checkoutMiniItems').innerHTML = lines.map(line => `
    <li><span>${escapeHtml(line.name)} × ${line.qty}</span><strong>${formatMoney(line.lineTotal)}</strong></li>
  `).join('');

  document.getElementById('coSubtotal').textContent = formatMoney(subtotal);
  document.getElementById('coDelivery').textContent = formatMoney(delivery);
  document.getElementById('coTax').textContent = formatMoney(tax);
  document.getElementById('coTotal').textContent = formatMoney(total);

  const discountRow = document.getElementById('coDiscountRow');
  if (discount > 0) {
    discountRow.hidden = false;
    document.getElementById('coDiscount').textContent = '−' + formatMoney(discount);
  } else {
    discountRow.hidden = true;
  }
}

const VALIDATORS = {
  custName: (v) => {
    if (!v.trim()) return 'Please enter your name.';
    if (v.trim().length < 2) return 'Name looks too short.';
    if (!/^[a-zA-Z\s.'-]+$/.test(v.trim())) return 'Name can only contain letters and spaces.';
    return '';
  },
  custPhone: (v) => {
    if (!v.trim()) return 'Please enter a phone number.';
    if (!/^[6-9]\d{9}$/.test(v.trim())) return 'Enter a valid 10-digit mobile number.';
    return '';
  },
  custEmail: (v) => {
    if (!v.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address.';
    return '';
  },
  custAddress: (v) => {
    if (!v.trim()) return 'Please enter a delivery address.';
    if (v.trim().length < 10) return 'Address seems too short — add more detail.';
    return '';
  },
};

function validateField(fieldName) {
  const input = document.getElementById(fieldName);
  const errorEl = document.getElementById('err-' + fieldName);
  const message = VALIDATORS[fieldName](input.value);

  input.closest('.field').classList.toggle('has-error', Boolean(message));
  errorEl.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function validateCheckoutForm() {
  const fields = ['custName', 'custPhone', 'custEmail', 'custAddress'];
  let allValid = true;
  let firstInvalid = null;

  fields.forEach(name => {
    const valid = validateField(name);
    if (!valid) {
      allValid = false;
      if (!firstInvalid) firstInvalid = name;
    }
  });

  if (firstInvalid) {
    document.getElementById(firstInvalid).focus();
  }

  return allValid;
}

function generateOrderId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return 'CB' + digits;
}

function estimateDeliveryTime() {
  const minutesToAdd = 35 + Math.floor(Math.random() * 11); // 35–45 mins
  const eta = new Date(Date.now() + minutesToAdd * 60000);
  const timeStr = eta.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${timeStr} (~${minutesToAdd} mins)`;
}

function placeOrder(customer) {
  if (getCartCount() === 0) {
    showToast('Your cart is empty.');
    showView('home');
    return;
  }

  const lines = getCartLines();
  const totals = calcTotals();

  state.lastOrder = {
    id: generateOrderId(),
    eta: estimateDeliveryTime(),
    customer,
    lines,
    totals,
  };

  // Clear cart + coupon
  state.cart = [];
  state.couponApplied = false;
  saveCart();
  updateCartBadge();

  renderConfirmation();
  showView('confirm');
}

function renderConfirmation() {
  const order = state.lastOrder;
  if (!order) return;

  document.getElementById('confOrderId').textContent = order.id;
  document.getElementById('confEta').textContent = order.eta;
  document.getElementById('confPayment').textContent = order.customer.payment;
  document.getElementById('confAddress').textContent = order.customer.address;

  document.getElementById('confSubtotal').textContent = formatMoney(order.totals.subtotal);
  document.getElementById('confDelivery').textContent = formatMoney(order.totals.delivery);
  document.getElementById('confTax').textContent = formatMoney(order.totals.tax);
  document.getElementById('confTotal').textContent = formatMoney(order.totals.total);

  const confDiscountRow = document.getElementById('confDiscountRow');
  if (order.totals.discount > 0) {
    confDiscountRow.hidden = false;
    document.getElementById('confDiscount').textContent = '−' + formatMoney(order.totals.discount);
  } else {
    confDiscountRow.hidden = true;
  }

  document.getElementById('confItems').innerHTML = order.lines.map(line => `
    <li><span>${escapeHtml(line.name)} × ${line.qty}</span><strong>${formatMoney(line.lineTotal)}</strong></li>
  `).join('');
}

function resetForNewOrder() {
  document.getElementById('checkoutForm').reset();
  document.querySelectorAll('.field').forEach(f => f.classList.remove('has-error'));
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  document.getElementById('couponInput').value = '';
  document.getElementById('couponMsg').textContent = '';
  state.couponApplied = false;
  document.getElementById('searchInput').value = '';
  state.searchTerm = '';
  state.activeCategory = 'All';
  renderCategories();
  renderMenu();
  showView('home');
}

/* =========================================================
   EVENT WIRING
   ========================================================= */
function initEvents() {
  // Top-level navigation (nav links + any element with data-nav)
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showView(el.dataset.nav);
    });
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', () => {
    state.searchTerm = searchInput.value;
    renderMenu();
  });

  // Details modal
  document.getElementById('detailsClose').addEventListener('click', closeDetails);
  document.getElementById('detailsOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'detailsOverlay') closeDetails();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('detailsOverlay').hidden) closeDetails();
  });
  document.getElementById('detailsQtyMinus').addEventListener('click', () => changeDetailsQty(-1));
  document.getElementById('detailsQtyPlus').addEventListener('click', () => changeDetailsQty(1));
  document.getElementById('detailsAddBtn').addEventListener('click', () => {
    if (state.detailsItemId == null) return;
    addToCart(state.detailsItemId, state.detailsQty);
    closeDetails();
  });

  // Coupon
  document.getElementById('applyCouponBtn').addEventListener('click', applyCoupon);
  document.getElementById('couponInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
  });

  // Cart item controls (qty +/-, remove) — delegated, bound once
  document.getElementById('cartItems').addEventListener('click', handleCartItemsClick);

  // Checkout button (cart -> checkout)
  document.getElementById('checkoutBtn').addEventListener('click', () => showView('checkout'));

  // Checkout form
  const form = document.getElementById('checkoutForm');
  ['custName', 'custPhone', 'custEmail', 'custAddress'].forEach(name => {
    document.getElementById(name).addEventListener('blur', () => validateField(name));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateCheckoutForm()) {
      showToast('Please fix the highlighted fields.');
      return;
    }
    const customer = {
      name: document.getElementById('custName').value.trim(),
      phone: document.getElementById('custPhone').value.trim(),
      email: document.getElementById('custEmail').value.trim(),
      address: document.getElementById('custAddress').value.trim(),
      payment: form.querySelector('input[name="payment"]:checked').value,
    };
    placeOrder(customer);
  });

  // New order
  document.getElementById('newOrderBtn').addEventListener('click', resetForNewOrder);
}

/* =========================================================
   INIT
   ========================================================= */
function init() {
  loadCart();
  renderCategories();
  renderMenu();
  updateCartBadge();
  initEvents();
  showView('home');
}

document.addEventListener('DOMContentLoaded', init);
