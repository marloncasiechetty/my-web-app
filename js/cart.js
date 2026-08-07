/**
 * Dose of Island - Global Cart Manager
 */
(function() {
  const FLAVOR_IMAGES = {
    'Watermelon': 'uploads/watermelon.png',
    'Pomegranate': 'uploads/pomegranate.png',
    'Passion Fruit': 'uploads/passionfruit.png',
    'Lime': 'uploads/lime.png',
    'Guava': 'uploads/guava.png',
    'Tamarind': 'uploads/tamarind.png'
  };

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('dose_cart')) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('dose_cart', JSON.stringify(cart));
    updateCartUI();
  }

  window.addToCart = function(name, priceStr, imageSrc) {
    const cart = getCart();
    const price = parseFloat((priceStr || '$2.49').replace('$', '')) || 2.49;
    const img = imageSrc || FLAVOR_IMAGES[name] || 'uploads/watermelon.png';

    const existing = cart.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1, image: img });
    }

    saveCart(cart);
    showToast(`Added ${name} to cart! 🍹`);
    openCartDrawer();
  };

  window.updateCartQty = function(name, change) {
    let cart = getCart();
    const item = cart.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (item) {
      item.qty += change;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.name.toLowerCase() !== name.toLowerCase());
      }
    }
    saveCart(cart);
  };

  window.removeFromCart = function(name) {
    const cart = getCart().filter(i => i.name.toLowerCase() !== name.toLowerCase());
    saveCart(cart);
  };

  function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Badges
    const badge = document.getElementById('cart-badge');
    if (badge) {
      badge.textContent = totalCount;
      badge.style.transform = 'scale(1.3)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }

    const menuCount = document.getElementById('menu-cart-count');
    if (menuCount) menuCount.textContent = totalCount;
    const menuCountFill = document.getElementById('menu-cart-count-fill');
    if (menuCountFill) menuCountFill.textContent = totalCount;

    const headerCount = document.getElementById('cart-header-count');
    if (headerCount) headerCount.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;

    // List Rendering
    const list = document.getElementById('cart-items-list');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-footer');
    const subtotalVal = document.getElementById('cart-subtotal-val');

    if (!list) return;

    if (cart.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (footer) footer.style.display = 'none';
      list.querySelectorAll('.cart-item-row').forEach(el => el.remove());
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (footer) footer.style.display = 'block';
      if (subtotalVal) subtotalVal.textContent = `$${subtotal.toFixed(2)}`;

      list.querySelectorAll('.cart-item-row').forEach(el => el.remove());

      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.style.cssText = 'display:flex;align-items:center;gap:14px;padding:12px;border-radius:16px;background:#F9F9F9;border:1px solid rgba(0,0,0,0.05);';
        row.innerHTML = `
          <img src="${item.image}" alt="${item.name}" style="width:48px;height:48px;object-fit:contain;background:#fff;border-radius:12px;padding:4px;flex-shrink:0;" />
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.95rem;color:#1F0A0A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
            <div style="font-size:0.82rem;color:#888;margin-top:2px;">$${item.price.toFixed(2)} each</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;background:#ffffff;border-radius:100px;padding:4px 8px;border:1px solid rgba(0,0,0,0.08);">
            <button onclick="window.updateCartQty('${item.name}', -1)" style="border:none;background:none;width:20px;height:20px;cursor:pointer;font-weight:bold;color:#555;display:flex;align-items:center;justify-content:center;">-</button>
            <span style="font-weight:700;font-size:0.85rem;min-width:16px;text-align:center;">${item.qty}</span>
            <button onclick="window.updateCartQty('${item.name}', 1)" style="border:none;background:none;width:20px;height:20px;cursor:pointer;font-weight:bold;color:#555;display:flex;align-items:center;justify-content:center;">+</button>
          </div>
          <button onclick="window.removeFromCart('${item.name}')" aria-label="Remove item" style="border:none;background:none;color:#aaa;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </button>
        `;
        list.appendChild(row);
      });
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:#1F0A0A;color:#ffffff;padding:12px 24px;border-radius:100px;font-family:"Outfit",sans-serif;font-weight:600;font-size:0.9rem;box-shadow:0 8px 24px rgba(0,0,0,0.25);z-index:10000;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;gap:8px;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2800);
  }

  window.openCartDrawer = function() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (overlay && drawer) {
      overlay.style.visibility = 'visible';
      overlay.style.opacity = '1';
      drawer.style.transform = 'translateX(0)';
    }
  };

  window.closeCartDrawer = function() {
    const overlay = document.getElementById('cart-drawer-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (overlay && drawer) {
      drawer.style.transform = 'translateX(100%)';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.visibility = 'hidden';
      }, 350);
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();

    // Event Listeners for Open / Close
    const headerBtn = document.getElementById('header-cart-btn');
    if (headerBtn) headerBtn.addEventListener('click', openCartDrawer);

    const menuCartTrigger = document.getElementById('menu-cart-trigger');
    if (menuCartTrigger) menuCartTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      // Close nav menu overlay if open
      const closeNavBtn = document.getElementById('nav-menu-close');
      if (closeNavBtn) closeNavBtn.click();
      openCartDrawer();
    });

    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);

    const backdrop = document.getElementById('cart-backdrop');
    if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', function() {
      alert('Thank you for choosing Dose of Island! Checkout integration complete. 🍹');
    });

    // Delegate Add to Cart buttons across site
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.add-to-cart-btn');
      if (btn) {
        e.preventDefault();
        const flavor = btn.getAttribute('data-flavor') || 'Pomegranate';
        const price = btn.getAttribute('data-price') || '$2.49';
        const img = btn.getAttribute('data-img') || FLAVOR_IMAGES[flavor];
        window.addToCart(flavor, price, img);
      }
    });
  });
})();
