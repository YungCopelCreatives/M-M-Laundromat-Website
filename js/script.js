// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }

  // Countdown Timer
  // Set your launch date here (format: YYYY-MM-DD HH:MM:SS)
  const launchDate = new Date('2025-06-01 00:00:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = launchDate - now;
    
    if (distance < 0) {
      // Launch date has passed
      const countdownEl = document.getElementById('countdown');
      if (countdownEl) {
        countdownEl.innerHTML = '<p style="text-align:center;font-size:1.25rem;color:var(--accent-yellow);font-weight:700;">🎉 We\'re Live! Download Now</p>';
      }
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }
  
  // Update countdown immediately and then every second
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Simple scroll animation
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, { threshold: 0.1 });
  fadeElements.forEach(el => observer.observe(el));

  // Sign-up form validation + submission to Google Sheets
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('signupSubmit');
      const submitText = document.getElementById('signupSubmitText');
      const submitLoader = document.getElementById('signupSubmitLoader');
      const successMessage = document.getElementById('signupMessage');
      const errorMessage = document.getElementById('signupError');
      
      if (!signupForm.checkValidity()) {
        signupForm.reportValidity();
        return;
      }
      
      const formData = new FormData(signupForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        city: formData.get('city') || 'Not provided',
        updates: formData.get('updates') || 'No',
        timestamp: new Date().toISOString()
      };
      
      try {
        // Hide previous messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.textContent = 'Joining...';
        submitLoader.style.display = 'inline';
        
        // Option 1: Google Apps Script Web App (Recommended)
        // Replace YOUR_GOOGLE_SCRIPT_URL with your Google Apps Script Web App URL
        // See instructions in comments below
        const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL'; // Replace with your Google Apps Script Web App URL
        
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL') {
          // Send to Google Sheets via Google Apps Script
          const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
          });
          
          // Since no-cors mode doesn't allow reading response, we assume success
          await new Promise(r => setTimeout(r, 800));
        } else {
          // Fallback: Store in localStorage and log (for testing)
          const waitlist = JSON.parse(localStorage.getItem('mm-waitlist') || '[]');
          waitlist.push(data);
          localStorage.setItem('mm-waitlist', JSON.stringify(waitlist));
          console.log('Waitlist entry:', data);
          await new Promise(r => setTimeout(r, 800));
        }
        
        // Show success message
        successMessage.style.display = 'block';
        signupForm.reset();
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
      } catch (err) {
        console.error('Sign-up error:', err);
        errorMessage.textContent = 'Sorry, something went wrong. Please try again or contact us directly.';
        errorMessage.style.display = 'block';
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.textContent = 'Join the Waitlist';
        submitLoader.style.display = 'none';
      }
    });
  }
  
  /* 
   * GOOGLE SHEETS INTEGRATION SETUP INSTRUCTIONS:
   * 
   * 1. Create a Google Sheet with these columns (in order):
   *    - Timestamp | Name | Email | Phone | Service | City | Updates
   * 
   * 2. Go to Extensions > Apps Script
   * 
   * 3. Paste this code in the Apps Script editor:
   * 
   * function doPost(e) {
   *   try {
   *     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   *     const data = JSON.parse(e.postData.contents);
   *     
   *     sheet.appendRow([
   *       data.timestamp,
   *       data.name,
   *       data.email,
   *       data.phone,
   *       data.service,
   *       data.city,
   *       data.updates
   *     ]);
   *     
   *     return ContentService.createTextOutput(JSON.stringify({success: true}))
   *       .setMimeType(ContentService.MimeType.JSON);
   *   } catch (error) {
   *     return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
   *       .setMimeType(ContentService.MimeType.JSON);
   *   }
   * }
   * 
   * 4. Save the script (File > Save)
   * 
   * 5. Deploy as Web App:
   *    - Click "Deploy" > "New deployment"
   *    - Choose type: "Web app"
   *    - Execute as: "Me"
   *    - Who has access: "Anyone"
   *    - Click "Deploy"
   *    - Copy the Web App URL
   * 
   * 6. Replace 'YOUR_GOOGLE_SCRIPT_URL' above with your Web App URL
   * 
   * Alternative: Use EmailJS (https://www.emailjs.com/) to send emails to Gmail
   */

  // Consent banner + GA placeholder
  const consentKey = 'mm-consent';
  function showConsent() {
    const banner = document.createElement('div');
    banner.className = 'consent-banner card-content';
    banner.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <span>We use cookies and analytics to improve your experience.</span>
        <div style="margin-left:auto">
          <button class="btn btn-outline" id="consent-decline">Decline</button>
          <button class="btn btn-primary" id="consent-accept">Accept</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
    banner.style.display = 'block';
    banner.querySelector('#consent-accept').addEventListener('click', () => {
      localStorage.setItem(consentKey, 'granted');
      banner.remove();
      initAnalytics();
    });
    banner.querySelector('#consent-decline').addEventListener('click', () => {
      localStorage.setItem(consentKey, 'denied');
      banner.remove();
    });
  }
  function initAnalytics() {
    const GA_ID = '';
    if (!GA_ID) return; // add your GA ID to enable
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s1);
    const s2 = document.createElement('script');
    s2.innerHTML = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_ID}');`;
    document.head.appendChild(s2);
  }
  const consent = localStorage.getItem(consentKey);
  if (consent === 'granted') initAnalytics();
  if (!consent) showConsent();

  // PWA service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  }

  // Parallax background (respects reduced motion)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateParallax() {
    const y = Math.round(window.scrollY * -0.1);
    document.body.style.setProperty('--bg-offset', reduceMotion ? '0px' : `${y}px`);
  }
  updateParallax();
  if (!reduceMotion) {
    window.addEventListener('scroll', updateParallax, { passive: true });
  }

  // ---------------------------
  // Products, Search, Cart, Checkout
  // ---------------------------
  const products = [
    { id: 'prod-1', name: 'Laundry Detergent', price: 89.99, image: '/images/placeholders/detergent.png', benefits: ['Deep clean', 'Color-safe', 'Low residue'], ingredients: ['Surfactants', 'Enzymes', 'Fragrance'], combos: ['Detergent + Softener'] },
    { id: 'prod-2', name: 'Fabric Softener', price: 59.99, image: '/images/placeholders/softener.png', benefits: ['Soft feel', 'Fresh scent'], ingredients: ['Cationic agents', 'Fragrance'], combos: ['Detergent + Softener'] },
    { id: 'prod-3', name: 'Stain Remover', price: 74.99, image: '/images/placeholders/stain-remover.png', benefits: ['Targets tough stains'], ingredients: ['Oxygen bleach', 'Solvents'], combos: ['Detergent + Stain Remover'] },
    { id: 'prod-4', name: 'Laundry Bag', price: 49.99, image: '/images/placeholders/laundry-bag.png', benefits: ['Protects delicates'], ingredients: ['Polyester mesh'], combos: ['Laundry Bag + Detergent'] }
  ];

  const productGrid = document.getElementById('productGrid');
  const productSearch = document.getElementById('productSearch');
  const clearSearch = document.getElementById('clearSearch');
  const cartButton = document.getElementById('cartButton');
  const cartCountEl = document.getElementById('cartCount');
  const drawer = document.getElementById('checkoutDrawer');
  const closeCheckout = document.getElementById('closeCheckout');
  const cartItemsEl = document.getElementById('cartItems');
  const subtotalText = document.getElementById('subtotalText');
  const deliveryText = document.getElementById('deliveryText');
  const totalText = document.getElementById('totalText');
  const checkoutForm = document.getElementById('checkoutForm');

  const COURIER_COSTS = {
    courier_guy: 85.0,
    aramex: 99.0,
    paxi: 60.0
  };

  let cart = []; // {id, name, price, qty}

  function formatZAR(value) {
    try {
      return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    } catch {
      return `R${value.toFixed(2)}`;
    }
  }

  function renderProducts(list) {
    if (!productGrid) return;
    productGrid.innerHTML = '';
    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-content" style="display:grid;gap:10px">
          <img src="${p.image}" alt="${p.name}" width="240" height="160" style="width:100%;max-width:260px;height:auto;margin:0 auto;border-radius:12px;background:#f3f4f6;object-fit:contain">
          <h3 class="step-title" style="margin:0">${p.name}</h3>
          <p class="step-description" style="margin:0">${formatZAR(p.price)}</p>
          <details>
            <summary>Benefits</summary>
            <ul style="margin-left:18px">${p.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
          </details>
          <details>
            <summary>Possible Ingredients</summary>
            <ul style="margin-left:18px">${p.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
          </details>
          <details>
            <summary>Suggested Combos</summary>
            <ul style="margin-left:18px">${p.combos.map(c => `<li>${c}</li>`).join('')}</ul>
          </details>
          <button class="btn btn-primary" data-add="${p.id}">Add to cart</button>
        </div>`;
      productGrid.appendChild(card);
    });
  }

  function saveCart() {
    try { localStorage.setItem('mm-cart', JSON.stringify(cart)); } catch {}
  }
  function loadCart() {
    try {
      const raw = localStorage.getItem('mm-cart');
      cart = raw ? JSON.parse(raw) : [];
    } catch { cart = []; }
  }
  function updateCartCount() {
    const count = cart.reduce((n, item) => n + item.qty, 0);
    if (cartCountEl) {
      cartCountEl.textContent = String(count);
      cartCountEl.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }
  function addToCart(productId) {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const existing = cart.find(i => i.id === prod.id);
    if (existing) existing.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    saveCart();
    updateCartCount();
    renderCart();
  }
  function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
  }
  function setQty(productId, qty) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart();
    updateCartCount();
    renderCart();
  }
  function getSelectedCourier() {
    const el = drawer ? drawer.querySelector('input[name=courier]:checked') : null;
    return el ? el.value : 'courier_guy';
  }
  function renderCart() {
    if (!cartItemsEl) return;
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="step-description">Your cart is empty.</p>';
    } else {
      cartItemsEl.innerHTML = '';
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'card';
        row.style.marginBottom = '8px';
        row.innerHTML = `
          <div class="card-content" style="display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 12px">
            <div>
              <div style="font-weight:600">${item.name}</div>
              <div class="step-description">${formatZAR(item.price)}</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn btn-outline" data-dec="${item.id}" style="padding:6px 10px">-</button>
              <input type="number" min="1" value="${item.qty}" data-qty="${item.id}" style="width:56px;padding:6px 8px;border-radius:8px;border:1px solid #374151;background:#0b1220;color:#fff">
              <button class="btn btn-outline" data-inc="${item.id}" style="padding:6px 10px">+</button>
              <button class="btn btn-primary" data-remove="${item.id}" style="padding:6px 10px;background:#ef4444">Remove</button>
            </div>
          </div>`;
        cartItemsEl.appendChild(row);
      });
    }
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const delivery = COURIER_COSTS[getSelectedCourier()] || 0;
    if (subtotalText) subtotalText.textContent = formatZAR(subtotal);
    if (deliveryText) deliveryText.textContent = formatZAR(cart.length > 0 ? delivery : 0);
    if (totalText) totalText.textContent = formatZAR(subtotal + (cart.length > 0 ? delivery : 0));
  }

  const overlay = document.getElementById('checkoutOverlay');
  
  function openDrawer() {
    if (!drawer) return;
    drawer.style.transform = 'translateX(0)';
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.style.display = 'block';
      setTimeout(() => { overlay.style.opacity = '1'; }, 10);
      overlay.setAttribute('aria-hidden', 'false');
    }
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.style.transform = 'translateX(100%)';
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
  }

  function initCatalog() {
    if (!productGrid) return;
    renderProducts(products);
    productGrid.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const addId = t.getAttribute('data-add');
      const decId = t.getAttribute('data-dec');
      const incId = t.getAttribute('data-inc');
      const remId = t.getAttribute('data-remove');
      if (addId) addToCart(addId);
      if (decId) {
        const item = cart.find(i => i.id === decId);
        if (item) setQty(decId, Math.max(1, item.qty - 1));
      }
      if (incId) {
        const item = cart.find(i => i.id === incId);
        if (item) setQty(incId, item.qty + 1);
      }
      if (remId) removeFromCart(remId);
    });
    if (productSearch) {
      productSearch.addEventListener('input', () => {
        const q = productSearch.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(q));
        renderProducts(filtered);
      });
    }
    if (clearSearch && productSearch) {
      clearSearch.addEventListener('click', () => {
        productSearch.value = '';
        renderProducts(products);
        productSearch.focus();
      });
    }
  }

  function initCartUI() {
    loadCart();
    updateCartCount();
    renderCart();
    if (cartButton) cartButton.addEventListener('click', openDrawer);
    if (closeCheckout) closeCheckout.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        const decId = t.getAttribute('data-dec');
        const incId = t.getAttribute('data-inc');
        const remId = t.getAttribute('data-remove');
        if (decId) {
          const item = cart.find(i => i.id === decId);
          if (item) setQty(decId, Math.max(1, item.qty - 1));
        }
        if (incId) {
          const item = cart.find(i => i.id === incId);
          if (item) setQty(incId, item.qty + 1);
        }
        if (remId) removeFromCart(remId);
      });
      drawer.addEventListener('change', (e) => {
        const t = e.target;
        if (!(t instanceof HTMLInputElement)) return;
        if (t.name === 'courier') renderCart();
        if (t.hasAttribute('data-qty')) {
          const id = t.getAttribute('data-qty');
          const val = parseInt(t.value, 10);
          if (id && Number.isFinite(val)) setQty(id, val);
        }
      });
    }
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (cart.length === 0) { alert('Your cart is empty.'); return; }
        const name = /** @type {HTMLInputElement} */(document.getElementById('nameInput')).value.trim();
        const phone = /** @type {HTMLInputElement} */(document.getElementById('phoneInput')).value.trim();
        const address = /** @type {HTMLInputElement} */(document.getElementById('addressInput')).value.trim();
        if (!name || !phone || !address) { alert('Please fill in your details.'); return; }
        const courier = getSelectedCourier();
        const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const delivery = COURIER_COSTS[courier] || 0;
        const total = subtotal + delivery;
        const lines = [
          `New order via website`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Address: ${address}`,
          `Courier: ${courier}`,
          '',
          'Items:'
        ];
        cart.forEach(i => lines.push(`- ${i.name} x${i.qty} = ${formatZAR(i.price * i.qty)}`));
        lines.push('', `Subtotal: ${formatZAR(subtotal)}`, `Delivery: ${formatZAR(delivery)}`, `Total: ${formatZAR(total)}`);
        const text = encodeURIComponent(lines.join('\n'));
        const whatsappNumber = '27629875647'; // TODO: replace with your business number
        const url = `https://wa.me/${whatsappNumber}?text=${text}`;
        window.open(url, '_blank');
      });
    }
  }

  initCatalog();
  initCartUI();
});



