(() => {
  const { db, save, esc, dog, totale, causale, applyTexts, MESI } = CANILE;
  applyTexts();

  // ---------- dogs list ----------
  const list = document.getElementById('dogList');
  const count = document.getElementById('dogCount');
  const filters = document.querySelector('.filters');
  const sex = (g) => (g === 'M' ? 'Maschio' : 'Femmina');
  const fixed = (x) => (x.neutered ? (x.gender === 'M' ? 'Castrato' : 'Sterilizzata') : (x.gender === 'M' ? 'Intero' : 'Intera'));

  const renderDogs = () => {
    const f = Object.fromEntries(new FormData(filters));
    const shown = db.dogs.filter((x) => x.stato === 'disponibile'
      && (!f.age || x.age === f.age) && (!f.gender || x.gender === f.gender) && (!f.size || x.size === f.size));
    count.textContent = shown.length ? `${shown.length} ${shown.length === 1 ? 'cane cerca' : 'cani cercano'} casa` : 'Nessun cane corrisponde ai filtri scelti.';
    list.innerHTML = shown.map((x) => `
      <article class="dog">
        <div class="dog__img"><img src="${esc(x.image)}" alt="${esc(x.name)}" loading="lazy" width="720" height="960"></div>
        <div class="dog__body">
          <h3>${esc(x.name)}</h3>
          <ul class="tags"><li>${esc(x.age)}</li><li>${sex(x.gender)}</li><li>taglia ${esc(x.size)}</li><li>${fixed(x)}</li></ul>
          <details><summary>La sua storia</summary><p>${esc(x.description)}</p></details>
          ${x.distanza ? `<a class="dog__distance" href="#adozione-distanza" data-dog="${esc(x.id)}">❤️ Adottalo a distanza</a>` : ''}
        </div>
      </article>`).join('');
  };
  filters.addEventListener('change', renderDogs);
  renderDogs();

  // ---------- distance adoption form ----------
  const form = document.getElementById('adoptForm');
  const pick = document.getElementById('pickDog');
  const months = document.getElementById('pickMonths');
  const total = document.getElementById('total');
  const error = document.getElementById('formError');
  const done = document.getElementById('adoptDone');
  const now = new Date();
  const years = [now.getFullYear(), now.getFullYear() + 1];

  pick.innerHTML = db.dogs.filter((x) => x.distanza).map((x) => `
    <label class="pick__item">
      <input type="radio" name="cane" value="${esc(x.id)}" required>
      <img src="${esc(x.image)}" alt="" width="120" height="120" loading="lazy">
      <span><strong>${esc(x.name)}</strong><small>${sex(x.gender)}, taglia ${esc(x.size)}</small><em>“${esc(x.quote)}”</em></span>
    </label>`).join('');

  const renderMonths = (year) => {
    const past = (i) => year === now.getFullYear() && i < now.getMonth();
    months.innerHTML = `
      <div class="months__years" role="radiogroup" aria-label="Anno">${years.map((y) => `<label><input type="radio" name="anno" value="${y}" ${y === year ? 'checked' : ''}> ${y}</label>`).join('')}</div>
      <div class="months__grid">${MESI.map((m, i) => `<label class="chip"><input type="checkbox" name="mesi" value="${i}" ${past(i) ? 'disabled' : ''}><span>${m.slice(0, 3)}<span class="sr"> ${m.slice(3)}</span></span></label>`).join('')}</div>`;
  };
  renderMonths(years[0]);

  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'anno') renderMonths(Number(ev.target.value));
    total.textContent = `${form.querySelectorAll('[name="mesi"]:checked').length * db.quota} €`;
  });

  // preselect dog from its card
  list.addEventListener('click', (ev) => {
    const id = ev.target.closest('[data-dog]')?.dataset.dog;
    const radio = id && pick.querySelector(`input[value="${CSS.escape(id)}"]`);
    if (radio) radio.checked = true;
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = new FormData(form);
    const mesi = data.getAll('mesi').map(Number);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const problems = [];
    if (!String(data.get('nome') || '').trim() || !String(data.get('cognome') || '').trim()) problems.push('nome e cognome');
    if (!form.email.checkValidity() || !email) problems.push('un’email valida');
    if (!form.regalo.checkValidity()) problems.push('un’email valida per il regalo');
    if (!data.get('cane')) problems.push('il cane da adottare');
    if (!mesi.length) problems.push('almeno un mese');
    if (!data.get('privacy')) problems.push('il consenso privacy');
    if (problems.length) { error.textContent = `Manca ${problems.join(', ')}.`; return; }
    error.textContent = '';

    const entry = {
      id: `w${Date.now()}`, data: new Date().toISOString().slice(0, 10),
      nome: String(data.get('nome')).trim(), cognome: String(data.get('cognome')).trim(), email,
      regalo: String(data.get('regalo') || '').trim(), cane: data.get('cane'), mesi, anno: Number(data.get('anno')),
      pagamento: 'attesa', ricevuta: false,
    };
    db.iscritti.push(entry);
    save();

    form.hidden = true;
    done.hidden = false;
    done.innerHTML = `
      <p class="adopt__hearts">💖💖💖</p>
      <h3>Grazie di cuore, ${esc(entry.nome)}! 🐾</h3>
      <p>Hai scelto di adottare a distanza <strong>${esc(dog(entry.cane).name)}</strong> per ${mesi.length} ${mesi.length === 1 ? 'mese' : 'mesi'}: ${mesi.map((i) => MESI[i]).join(', ')} ${entry.anno}.</p>
      <p>L'ultimo passaggio è effettuare in autonomia il pagamento di <strong>${totale(entry)} €</strong>:</p>
      <dl class="pay">
        <div><dt>PayPal</dt><dd>${esc(db.texts.distanza_paypal)}</dd></div>
        <div><dt>Bonifico</dt><dd>Intesa Sanpaolo · Ass.ne Impronte di Zampe nel Cuore O.D.V.<br>IBAN ${esc(db.texts.iban)}</dd></div>
        <div><dt>Causale</dt><dd>${esc(causale(entry))}</dd></div>
      </dl>
      <p>La tua iscrizione è registrata: dall'<a href="area-riservata.html?email=${encodeURIComponent(email)}">area riservata</a> puoi seguire lo stato del pagamento, i mesi coperti e chiedere la ricevuta per la detrazione.</p>
      <p class="hint">Dubbi? Scrivici a ${esc(db.texts.distanza_email)}</p>`;
    done.focus();
  });
})();
