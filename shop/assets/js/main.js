(() => {
  const SHOP = window.SHOP || { products: [], categories: {}, freeShipping: 60, shipping: 6.9, express: 12.9, coupons: {} };
  const byId = Object.fromEntries(SHOP.products.map((p) => [p.id, p]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const eur = (v) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- storage (falls back to memory if unavailable) ----------
  const mem = {};
  const load = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return mem[key] ?? fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { mem[key] = value; }
  };

  let cart = load('shop-cart', []);          // [{ id, color, qty }]
  let wish = load('shop-wishlist', []);      // [id]
  let coupon = load('shop-coupon', null);    // 'BENVENUTO10'

  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + (byId[l.id] ? byId[l.id].price * l.qty : 0), 0);

  const totals = (method = 'standard') => {
    const sub = subtotal();
    const rate = coupon && SHOP.coupons[coupon] ? SHOP.coupons[coupon] : 0;
    const discount = Math.round(sub * rate * 100) / 100;
    const net = sub - discount;
    let ship = 0;
    if (cart.length) ship = method === 'express' ? SHOP.express : (net >= SHOP.freeShipping ? 0 : SHOP.shipping);
    return { sub, discount, ship, total: net + ship };
  };

  // ---------- footer year, mobile nav ----------
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  const toggle = $('.nav__toggle');
  const list = $('#nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('is-open', !open);
    });
  }

  // ---------- toast ----------
  const toastEl = $('.toast');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  };

  // ---------- badges ----------
  const renderBadges = () => {
    $$('[data-cart-count]').forEach((b) => { const n = cartCount(); b.textContent = n; b.hidden = !n; });
    $$('[data-wish-count]').forEach((b) => { b.textContent = wish.length; b.hidden = !wish.length; });
    $$('[data-wish]').forEach((b) => {
      const on = wish.includes(b.dataset.wish);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-on', on);
    });
  };

  // ---------- free shipping progress ----------
  const renderShipBars = () => {
    const net = totals().sub - totals().discount;
    const left = Math.max(0, SHOP.freeShipping - net);
    const pct = Math.min(100, (net / SHOP.freeShipping) * 100);
    $$('[data-ship-bar]').forEach((el) => {
      el.innerHTML = cart.length
        ? `<p>${left > 0 ? `Ti mancano <strong>${eur(left)}</strong> per la spedizione gratuita` : '<strong>Spedizione gratuita</strong> sbloccata!'}</p><span class="ship-bar__track"><span style="width:${pct}%"></span></span>`
        : '';
    });
  };

  // ---------- cart operations ----------
  const addToCart = (id, qty = 1, color) => {
    const p = byId[id];
    if (!p) return;
    color = color || p.colors[0];
    const line = cart.find((l) => l.id === id && l.color === color);
    if (line) line.qty = Math.min(10, line.qty + qty); else cart.push({ id, color, qty });
    save('shop-cart', cart);
    renderAll();
    openDrawer();
  };

  const setQty = (index, qty) => {
    if (!cart[index]) return;
    if (qty <= 0) cart.splice(index, 1); else cart[index].qty = Math.min(10, qty);
    save('shop-cart', cart);
    renderAll();
  };

  // ---------- mini cart drawer ----------
  const drawer = $('#cart-drawer');
  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $('[data-cart-close].icon-btn', drawer)?.focus();
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  };
  $$('[data-cart-open]').forEach((b) => b.addEventListener('click', openDrawer));
  $$('[data-cart-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  const lineHtml = (l, i, compact) => {
    const p = byId[l.id];
    if (!p) return '';
    return `<li class="line${compact ? ' line--compact' : ''}">
      <a class="line__img" href="prodotto-${p.id}.html"><img src="assets/img/${p.img}" alt=""></a>
      <div class="line__info">
        <a href="prodotto-${p.id}.html"><strong>${esc(p.name)}</strong></a>
        <span>${esc(l.color)}</span>
        <div class="qty qty--sm">
          <button type="button" data-line-step="-1" data-index="${i}" aria-label="Diminuisci">−</button>
          <span aria-live="polite">${l.qty}</span>
          <button type="button" data-line-step="1" data-index="${i}" aria-label="Aumenta">+</button>
        </div>
      </div>
      <div class="line__end">
        <strong>${eur(p.price * l.qty)}</strong>
        <button class="line__remove" type="button" data-line-remove="${i}">Rimuovi</button>
      </div>
    </li>`;
  };

  const renderDrawer = () => {
    const body = $('[data-mini-cart]');
    if (!body) return;
    body.innerHTML = cart.length
      ? `<ul class="lines">${cart.map((l, i) => lineHtml(l, i, true)).join('')}</ul>`
      : '<p class="empty">Il carrello è vuoto.</p>';
    const st = $('[data-mini-subtotal]');
    if (st) st.textContent = eur(subtotal());
  };

  document.addEventListener('click', (e) => {
    const step = e.target.closest('[data-line-step]');
    if (step) { const i = +step.dataset.index; setQty(i, cart[i].qty + (+step.dataset.lineStep)); return; }
    const rm = e.target.closest('[data-line-remove]');
    if (rm) { setQty(+rm.dataset.lineRemove, 0); return; }

    const add = e.target.closest('[data-add]');
    if (add) {
      let qty = 1;
      let color;
      if (add.hasAttribute('data-from-pdp')) {
        qty = Math.max(1, Math.min(10, +($('[data-qty] input')?.value || 1)));
        color = $('input[name="color"]:checked')?.value;
      }
      addToCart(add.dataset.add, qty, color);
      return;
    }

    const w = e.target.closest('[data-wish]');
    if (w) {
      const id = w.dataset.wish;
      const on = wish.includes(id);
      wish = on ? wish.filter((x) => x !== id) : [...wish, id];
      save('shop-wishlist', wish);
      toast(on ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti');
      renderAll();
    }
  });

  // ---------- product page ----------
  $$('[data-thumb]').forEach((t) => t.addEventListener('click', () => {
    const main = $('#pdp-main');
    if (main) main.src = t.dataset.thumb;
    $$('[data-thumb]').forEach((x) => x.classList.toggle('is-active', x === t));
  }));
  $$('[data-qty]').forEach((q) => {
    const input = $('input', q);
    $$('[data-step]', q).forEach((b) => b.addEventListener('click', () => {
      input.value = Math.max(1, Math.min(10, (+input.value || 1) + (+b.dataset.step)));
    }));
  });

  // ---------- product card markup (wishlist page) ----------
  const cardHtml = (p) => `<li class="pcard">
      <a class="pcard__media" href="prodotto-${p.id}.html"><img src="assets/img/${p.img}" alt="${esc(p.alt)}" loading="lazy"></a>
      <button class="pcard__wish" type="button" data-wish="${p.id}" aria-pressed="true" aria-label="Rimuovi ${esc(p.name)} dai preferiti">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9z"/></svg>
      </button>
      <div class="pcard__body">
        <span class="pcard__cat">${esc(SHOP.categories[p.cat] || '')}</span>
        <h3><a href="prodotto-${p.id}.html">${esc(p.name)}</a></h3>
        <p class="pcard__price"><span class="price">${eur(p.price)}</span></p>
        <button class="btn btn--ghost btn--sm btn--block" type="button" data-add="${p.id}">Aggiungi al carrello</button>
      </div>
    </li>`;

  const renderWishPage = () => {
    const grid = $('[data-wish-grid]');
    if (!grid) return;
    const items = wish.map((id) => byId[id]).filter(Boolean);
    grid.innerHTML = items.map(cardHtml).join('');
    $('[data-wish-empty]').hidden = items.length > 0;
  };

  // ---------- shop: filters, sort, search ----------
  const grid = $('#shop-grid');
  if (grid) {
    const params = new URLSearchParams(location.search);
    const q = (params.get('q') || '').trim().toLowerCase();
    const catParam = params.get('cat');
    const qInput = $('#q');
    if (qInput && q) qInput.value = params.get('q');
    if (catParam) $$('input[name="cat"]').forEach((c) => { c.checked = c.value === catParam; });

    const cards = $$('.pcard', grid);
    const order = cards.slice();
    const range = $('#price-max');
    const out = $('#price-out');
    const sale = $('#only-sale');
    const sort = $('#sort');

    const apply = () => {
      const cats = $$('input[name="cat"]:checked').map((c) => c.value);
      const max = +range.value;
      out.textContent = eur(max).replace(',00', '');
      let shown = 0;
      cards.forEach((c) => {
        const p = byId[c.dataset.id];
        const ok = (!cats.length || cats.includes(p.cat))
          && p.price <= max
          && (!sale.checked || p.compare)
          && (!q || c.dataset.name.includes(q) || (SHOP.categories[p.cat] || '').toLowerCase().includes(q));
        c.hidden = !ok;
        if (ok) shown += 1;
      });
      const sorted = order.slice();
      if (sort.value === 'price-asc') sorted.sort((a, b) => a.dataset.price - b.dataset.price);
      if (sort.value === 'price-desc') sorted.sort((a, b) => b.dataset.price - a.dataset.price);
      if (sort.value === 'name') sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
      sorted.forEach((c) => grid.appendChild(c));
      $('#results-count').textContent = `${shown} ${shown === 1 ? 'prodotto' : 'prodotti'}${q ? ` per “${params.get('q')}”` : ''}`;
      $('#shop-empty').hidden = shown > 0;
    };

    $$('input[name="cat"]').forEach((c) => c.addEventListener('change', apply));
    [range, sale, sort].forEach((el) => el.addEventListener('input', apply));
    $('#filters-reset').addEventListener('click', () => {
      $$('input[name="cat"]').forEach((c) => { c.checked = false; });
      range.value = range.max;
      sale.checked = false;
      sort.value = 'featured';
      apply();
    });
    apply();
  }

  // ---------- totals block (cart + checkout) ----------
  const shipMethod = () => $('input[name="ship"]:checked')?.value || 'standard';
  const renderTotals = () => {
    const t = totals(shipMethod());
    $$('[data-totals]').forEach((dl) => {
      dl.innerHTML = `<dt>Subtotale</dt><dd>${eur(t.sub)}</dd>`
        + (t.discount ? `<dt>Sconto (${esc(coupon)})</dt><dd>−${eur(t.discount)}</dd>` : '')
        + `<dt>Spedizione</dt><dd>${cart.length ? (t.ship ? eur(t.ship) : 'Gratuita') : '—'}</dd>`
        + `<dt class="totals__grand">Totale</dt><dd class="totals__grand">${eur(t.total)}</dd>`;
    });
    const std = $('[data-ship-standard]');
    if (std) std.textContent = totals('standard').ship ? eur(SHOP.shipping) : 'Gratuita';
  };

  // ---------- cart page ----------
  const renderCartPage = () => {
    const lines = $('[data-cart-lines]');
    if (!lines) return;
    lines.innerHTML = cart.map((l, i) => lineHtml(l, i, false)).join('');
    $('[data-cart-empty]').hidden = cart.length > 0;
    $('[data-summary]').hidden = cart.length === 0;
  };

  const couponForm = $('[data-coupon]');
  if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = $('input', couponForm).value.trim().toUpperCase();
      const msg = $('[data-coupon-msg]');
      if (SHOP.coupons[code]) {
        coupon = code;
        save('shop-coupon', coupon);
        msg.textContent = `Codice ${code} applicato: −${SHOP.coupons[code] * 100}%`;
      } else {
        msg.textContent = 'Codice non valido.';
      }
      renderAll();
    });
  }

  // ---------- checkout ----------
  const checkout = $('[data-checkout]');
  const renderCheckout = () => {
    const ul = $('[data-summary-lines]');
    if (!ul) return;
    ul.innerHTML = cart.length
      ? cart.map((l) => { const p = byId[l.id]; return p ? `<li><img src="assets/img/${p.img}" alt=""><span><strong>${esc(p.name)}</strong> ${esc(l.color)} × ${l.qty}</span><em>${eur(p.price * l.qty)}</em></li>` : ''; }).join('')
      : '<li class="empty">Il carrello è vuoto. <a href="shop.html">Vai al negozio</a></li>';
  };

  const validate = (form) => {
    let firstBad = null;
    $$('input[required]', form).forEach((f) => {
      const err = $(`[data-error-for="${f.id}"]`, form);
      let msg = '';
      if (f.validity.valueMissing) msg = 'Campo obbligatorio.';
      else if (f.validity.typeMismatch) msg = 'Inserisci un indirizzo email valido.';
      else if (f.validity.patternMismatch) msg = 'Inserisci un CAP di 5 cifre.';
      f.setAttribute('aria-invalid', String(Boolean(msg)));
      if (err) err.textContent = msg;
      if (msg && !firstBad) firstBad = f;
    });
    firstBad?.focus();
    return !firstBad;
  };

  if (checkout) {
    $$('input[name="ship"]').forEach((r) => r.addEventListener('change', renderTotals));
    $('#checkout-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!cart.length) { toast('Il carrello è vuoto'); return; }
      if (!validate(e.target)) return;
      $('[data-order-id]').textContent = `#SH-${Math.floor(100000 + Math.random() * 900000)}`;
      cart = [];
      coupon = null;
      save('shop-cart', cart);
      save('shop-coupon', coupon);
      checkout.hidden = true;
      $('.steps-bar li.is-current')?.classList.replace('is-current', 'is-done');
      $('.steps-bar li:last-child')?.classList.add('is-current');
      $('[data-confirm]').hidden = false;
      renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---------- contact form (demo: validates, does not send) ----------
  const form = $('#contact-form');
  if (form) {
    const status = $('.form__status', form);
    const messages = { valueMissing: 'Campo obbligatorio.', typeMismatch: 'Inserisci un indirizzo email valido.', tooShort: 'Il testo è troppo breve.' };
    const check = (field) => {
      const err = $(`[data-error-for="${field.id}"]`, form);
      const key = Object.keys(messages).find((k) => field.validity[k]);
      field.setAttribute('aria-invalid', String(!field.validity.valid));
      if (err) err.textContent = field.validity.valid ? '' : (key ? messages[key] : 'Valore non valido.');
      return field.validity.valid;
    };
    $$('input, select, textarea', form).forEach((f) => f.addEventListener('blur', () => check(f)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = $$('input, select, textarea', form);
      if (!fields.map(check).every(Boolean)) { fields.find((f) => !f.validity.valid)?.focus(); return; }
      form.reset();
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      status.hidden = false;
      status.focus();
    });
  }

  // ---------- other demo forms ----------
  $$('[data-demo-form]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    $('.form__status', f).hidden = false;
  }));
  $$('[data-newsletter]').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('input', f);
    if (!input.validity.valid) { input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
    input.removeAttribute('aria-invalid');
    $('.newsletter__ok', f).hidden = false;
  }));

  // ---------- cookie notice (technical storage only) ----------
  const banner = $('#cookie-banner');
  if (banner) {
    banner.hidden = load('shop-cookie-ok', false) === 1 || load('shop-cookie-ok', false) === '1';
    $('button', banner).addEventListener('click', () => {
      banner.hidden = true;
      try { localStorage.setItem('shop-cookie-ok', '1'); } catch (e) { /* storage unavailable */ }
    });
  }

  const renderAll = () => {
    renderBadges();
    renderDrawer();
    renderShipBars();
    renderCartPage();
    renderCheckout();
    renderTotals();
    renderWishPage();
  };
  renderAll();
})();
