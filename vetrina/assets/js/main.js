(() => {
  // ---------- footer year ----------
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---------- mobile nav ----------
  const toggle = document.querySelector('.nav__toggle');
  const list = document.getElementById('nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('is-open', !open);
    });
  }

  // ---------- product filters ----------
  const filters = document.querySelectorAll('.filters button');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      document.querySelectorAll('.product').forEach((p) => {
        p.hidden = cat !== 'all' && p.dataset.cat !== cat;
      });
    });
  });

  // ---------- contact form (demo: validates, does not send) ----------
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form__status');
    const messages = {
      valueMissing: 'Campo obbligatorio.',
      typeMismatch: 'Inserisci un indirizzo email valido.',
      tooShort: 'Il testo è troppo breve.',
    };

    const check = (field) => {
      const err = form.querySelector(`[data-error-for="${field.id}"]`);
      const key = Object.keys(messages).find((k) => field.validity[k]);
      field.setAttribute('aria-invalid', String(!field.validity.valid));
      if (err) err.textContent = field.validity.valid ? '' : (key ? messages[key] : 'Valore non valido.');
      return field.validity.valid;
    };

    form.querySelectorAll('input, select, textarea').forEach((f) => {
      f.addEventListener('blur', () => check(f));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input, select, textarea')];
      const valid = fields.map(check).every(Boolean);
      if (!valid) {
        fields.find((f) => !f.validity.valid)?.focus();
        return;
      }
      form.reset();
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      status.hidden = false;
      status.focus();
    });
  }

  // ---------- cookie notice (technical cookies only) ----------
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    let seen = false;
    try { seen = localStorage.getItem('vetrina-cookie-ok') === '1'; } catch (e) { /* storage unavailable */ }
    banner.hidden = seen;
    banner.querySelector('button').addEventListener('click', () => {
      banner.hidden = true;
      try { localStorage.setItem('vetrina-cookie-ok', '1'); } catch (e) { /* storage unavailable */ }
    });
  }
})();
